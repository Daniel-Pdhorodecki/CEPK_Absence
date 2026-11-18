"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRH } from "@/lib/session";

const PATH = "/rh/solicitacoes";

function fail(message: string): never {
  redirect(`${PATH}?erro=${encodeURIComponent(message)}`);
}

export async function reviewAbsenceAction(formData: FormData): Promise<void> {
  const rh = await requireRH();
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (decision !== "APPROVE" && decision !== "REJECT") {
    fail("Decisão inválida.");
  }

  const request = await prisma.absenceRequest.findUnique({ where: { id } });
  if (!request || request.companyId !== rh.companyId) {
    fail("Solicitação não encontrada.");
  }
  if (request.status !== "PENDING") {
    fail("Esta solicitação já foi analisada.");
  }
  if (decision === "REJECT" && note.length < 3) {
    fail("Explique o motivo da reprovação (mínimo 3 caracteres).");
  }

  await prisma.absenceRequest.update({
    where: { id: request.id },
    data: {
      status: decision === "APPROVE" ? "APPROVED" : "REJECTED",
      reviewedById: rh.id,
      reviewedAt: new Date(),
      reviewNote: note || null,
    },
  });

  revalidatePath("/rh");
  revalidatePath("/rh/solicitacoes");
  revalidatePath("/rh/funcionarios");
  revalidatePath("/app");
  revalidatePath("/app/faltas");

  redirect(
    `${PATH}?ok=${encodeURIComponent(
      decision === "APPROVE" ? "Solicitação aprovada." : "Solicitação reprovada.",
    )}`,
  );
}
