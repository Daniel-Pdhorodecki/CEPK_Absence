"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const PATH = "/admin/cadastros";

function fail(message: string): never {
  redirect(`${PATH}?erro=${encodeURIComponent(message)}`);
}

async function reviewRegistration(
  formData: FormData,
  status: "APPROVED" | "REJECTED",
): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!id) fail("Cadastro não encontrado.");
  if (status === "REJECTED" && note.length < 3) {
    fail("Explique o motivo da reprovação (mínimo 3 caracteres).");
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, companyId: true, status: true },
  });

  if (!target || target.companyId !== admin.companyId) {
    fail("Cadastro não encontrado nesta instituição.");
  }
  if (target.status !== "PENDING") {
    fail("Este cadastro já foi analisado.");
  }

  await prisma.user.update({
    where: { id: target.id },
    data: {
      status,
      reviewNote: note || null,
      approvedById: admin.id,
      approvedAt: new Date(),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/cadastros");
  revalidatePath("/admin/funcionarios");

  redirect(
    `${PATH}?ok=${encodeURIComponent(
      status === "APPROVED" ? "Cadastro aprovado." : "Cadastro reprovado.",
    )}`,
  );
}

export async function approveRegistrationAction(formData: FormData): Promise<void> {
  await reviewRegistration(formData, "APPROVED");
}

export async function rejectRegistrationAction(formData: FormData): Promise<void> {
  await reviewRegistration(formData, "REJECTED");
}
