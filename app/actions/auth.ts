"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { institutionalEmailError, isInstitutionalEmail } from "@/lib/email";
import { getInstitution } from "@/lib/institution";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";

const DEFAULT_PASSWORD_HASH_ROUNDS = 10;

function fail(path: string, message: string): never {
  redirect(`${path}?erro=${encodeURIComponent(message)}`);
}

function normalizeEmail(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim().toLowerCase();
}

function text(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

function validateAccount(
  path: string,
  name: string,
  email: string,
  password: string,
): void {
  if (name.length < 3) fail(path, "Informe seu nome completo.");
  if (!isInstitutionalEmail(email)) fail(path, institutionalEmailError());
  if (password.length < 6) fail(path, "A senha precisa ter pelo menos 6 caracteres.");
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    fail("/login", "Preencha e-mail e senha.");
  }
  if (!isInstitutionalEmail(email)) {
    fail("/login", institutionalEmailError());
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    fail("/login", "E-mail ou senha inválidos.");
  }

  if (user.status === "PENDING") {
    fail(
      "/login",
      "Seu cadastro ainda está aguardando aprovação da administração.",
    );
  }
  if (user.status !== "APPROVED") {
    fail(
      "/login",
      "Seu cadastro não foi aprovado. Procure a administração da escola.",
    );
  }

  await createSession(user.id);
  redirect(user.role === "ADMIN" ? "/admin" : "/app");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function registerAction(formData: FormData): Promise<void> {
  const path = "/registro";
  const name = text(formData.get("name"));
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const staffType = text(formData.get("staffType")).toUpperCase();
  const position = text(formData.get("position"));

  validateAccount(path, name, email, password);

  if (staffType !== "PROFESSOR" && staffType !== "FUNCIONARIO") {
    fail(path, "Escolha se você é professor(a) ou funcionário(a).");
  }
  if (staffType === "FUNCIONARIO" && position.length < 2) {
    fail(path, "Informe seu cargo (ex.: monitor, limpeza, manutenção).");
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { status: true },
  });

  if (existing) {
    if (existing.status === "PENDING") {
      fail(path, "Este e-mail já possui um cadastro aguardando aprovação.");
    }
    if (existing.status === "APPROVED") {
      fail(path, "Este e-mail já está cadastrado. Faça login.");
    }
    fail(
      path,
      "Este e-mail já possui um cadastro não aprovado. Procure a administração.",
    );
  }

  const company = await getInstitution();
  const passwordHash = await bcrypt.hash(password, DEFAULT_PASSWORD_HASH_ROUNDS);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "EMPLOYEE",
      staffType,
      position: staffType === "FUNCIONARIO" ? position : null,
      status: "PENDING",
      companyId: company.id,
    },
  });

  redirect("/registro?enviado=1");
}
