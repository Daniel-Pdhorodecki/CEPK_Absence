"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

import { generateCompanyCode } from "@/lib/constants";
import { parseImageUpload } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

async function generateUniqueCode(prefix = ""): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generateCompanyCode(prefix);
    const exists = await prisma.company.findFirst({
      where: { OR: [{ employeeCode: code }, { rhCode: code }] },
      select: { id: true },
    });
    if (!exists) return code;
  }
  throw new Error("Não foi possível gerar um código único.");
}

function validateAccount(
  path: string,
  name: string,
  email: string,
  password: string,
): void {
  if (name.length < 3) fail(path, "Informe seu nome completo.");
  if (!EMAIL_REGEX.test(email)) fail(path, "Informe um e-mail válido.");
  if (password.length < 6) fail(path, "A senha precisa ter pelo menos 6 caracteres.");
}

export async function loginAction(formData: FormData): Promise<void> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    fail("/login", "Preencha e-mail e senha.");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    fail("/login", "E-mail ou senha inválidos.");
  }

  await createSession(user.id);
  redirect(user.role === "RH" ? "/rh" : "/app");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function registerEmployeeAction(formData: FormData): Promise<void> {
  const path = "/registro/funcionario";
  const name = text(formData.get("name"));
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const code = text(formData.get("companyCode")).toUpperCase();

  validateAccount(path, name, email, password);
  if (!code) fail(path, "Informe o código da empresa.");

  const company = await prisma.company.findUnique({ where: { employeeCode: code } });
  if (!company) fail(path, "Código de empresa não encontrado. Confirme com o RH.");

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) fail(path, "Este e-mail já está cadastrado. Faça login.");

  const passwordHash = await bcrypt.hash(password, DEFAULT_PASSWORD_HASH_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "EMPLOYEE",
      companyId: company.id,
    },
  });

  await createSession(user.id);
  redirect("/app");
}

export async function registerCompanyAction(formData: FormData): Promise<void> {
  const path = "/registro/rh";
  const name = text(formData.get("name"));
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const companyName = text(formData.get("companyName"));

  validateAccount(path, name, email, password);
  if (companyName.length < 2) fail(path, "Informe o nome da empresa.");

  const { image: logo, error: logoError } = await parseImageUpload(
    formData.get("logo"),
  );
  if (logoError) fail(path, logoError);

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) fail(path, "Este e-mail já está cadastrado. Faça login.");

  const employeeCode = await generateUniqueCode();
  const rhCode = await generateUniqueCode("RH");
  const passwordHash = await bcrypt.hash(password, DEFAULT_PASSWORD_HASH_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: companyName,
        employeeCode,
        rhCode,
        hasLogo: Boolean(logo),
      },
    });

    if (logo) {
      await tx.companyLogo.create({
        data: { companyId: company.id, data: logo.data, type: logo.type },
      });
    }

    const createdUser = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "RH",
        isOwner: true,
        companyId: company.id,
      },
    });

    await tx.company.update({
      where: { id: company.id },
      data: { ownerId: createdUser.id },
    });

    return createdUser;
  });

  await createSession(user.id);
  redirect("/rh?bemvindo=1");
}

export async function registerRhAction(formData: FormData): Promise<void> {
  const path = "/registro/rh";
  const name = text(formData.get("name"));
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const code = text(formData.get("rhCode")).toUpperCase();

  validateAccount(path, name, email, password);
  if (!code) fail(path, "Informe o código de RH da empresa.");

  const company = await prisma.company.findUnique({ where: { rhCode: code } });
  if (!company) fail(path, "Código de RH não encontrado. Peça ao responsável da empresa.");

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) fail(path, "Este e-mail já está cadastrado. Faça login.");

  const passwordHash = await bcrypt.hash(password, DEFAULT_PASSWORD_HASH_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "RH",
      companyId: company.id,
    },
  });

  await createSession(user.id);
  redirect("/rh");
}
