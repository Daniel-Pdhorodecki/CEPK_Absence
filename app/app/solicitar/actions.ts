"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { dateToISO, isoToDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { isValidISODate, validateAbsenceInput } from "@/lib/rules";
import { requireEmployee } from "@/lib/session";

const PATH = "/app/solicitar";

function fail(message: string): never {
  redirect(`${PATH}?erro=${encodeURIComponent(message)}`);
}

export async function createAbsenceRequest(formData: FormData): Promise<void> {
  const user = await requireEmployee();

  const kind = String(formData.get("kind") ?? "COMMON");
  const shift = String(formData.get("shift") ?? "");
  const startISO = String(formData.get("startDate") ?? "");
  const endISO = String(formData.get("endDate") || startISO);
  const reason = String(formData.get("reason") ?? "").trim();

  const proofEntry = formData.get("proof");
  const proof = proofEntry instanceof File && proofEntry.size > 0 ? proofEntry : null;

  if (!isValidISODate(startISO)) {
    fail("Selecione o período no calendário.");
  }

  const termination = await prisma.notice.findFirst({
    where: { targetUserId: user.id, type: "TERMINATION" },
    orderBy: { lastWorkingDay: "desc" },
  });

  const terminationLastDayISO = termination?.lastWorkingDay
    ? dateToISO(termination.lastWorkingDay)
    : null;

  const error = validateAbsenceInput({
    kind,
    shift,
    startISO,
    endISO,
    reason,
    proof: proof ? { size: proof.size, type: proof.type } : null,
    terminationLastDayISO,
  });

  if (error) fail(error);

  const startDate = isoToDate(startISO);
  const endDate = isoToDate(endISO);

  const overlapping = await prisma.absenceRequest.findFirst({
    where: {
      userId: user.id,
      status: { in: ["PENDING", "APPROVED"] },
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
    select: { id: true, startDate: true, endDate: true },
  });

  if (overlapping) {
    fail("Você já tem um pedido que se sobrepõe a esse período.");
  }

  let proofData: Uint8Array<ArrayBuffer> | null = null;
  if (kind === "MEDICAL" && proof) {
    proofData = new Uint8Array(await proof.arrayBuffer());
  }

  await prisma.absenceRequest.create({
    data: {
      userId: user.id,
      companyId: user.companyId,
      startDate,
      endDate,
      shift,
      kind,
      reason,
      proofName: proof ? proof.name : null,
      proofType: proof ? proof.type : null,
      proofData,
      status: "PENDING",
      autoApproved: false,
      reviewedAt: null,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/faltas");
  revalidatePath("/rh");
  revalidatePath("/rh/solicitacoes");

  redirect(`/app/faltas?ok=${encodeURIComponent("Solicitação enviada para análise do RH.")}`);
}

export async function cancelAbsenceRequest(formData: FormData): Promise<void> {
  const user = await requireEmployee();
  const id = String(formData.get("id") ?? "");

  const request = await prisma.absenceRequest.findUnique({ where: { id } });
  if (!request || request.userId !== user.id) fail("Solicitação não encontrada.");
  if (request.status !== "PENDING") fail("Apenas pedidos pendentes podem ser cancelados.");

  await prisma.absenceRequest.delete({ where: { id: request.id } });

  revalidatePath("/app");
  revalidatePath("/app/faltas");
  revalidatePath("/rh/solicitacoes");

  redirect(`/app/faltas?ok=${encodeURIComponent("Solicitação cancelada.")}`);
}
