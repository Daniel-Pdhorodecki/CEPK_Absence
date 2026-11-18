"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isoToDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { validateTermination } from "@/lib/rules";
import { requireAdmin } from "@/lib/session";

const PATH = "/admin/avisos";

function fail(message: string): never {
  redirect(`${PATH}?erro=${encodeURIComponent(message)}`);
}

export async function createNoticeAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const type = String(formData.get("type") ?? "GENERAL");
  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const targetUserId = String(formData.get("targetUserId") ?? "");
  const lastWorkingDayISO = String(formData.get("lastWorkingDay") ?? "");

  if (type !== "GENERAL" && type !== "TERMINATION") {
    fail("Tipo de aviso inválido.");
  }
  if (title.length < 3) fail("Informe um título com pelo menos 3 caracteres.");
  if (message.length < 5) fail("Escreva uma mensagem com pelo menos 5 caracteres.");

  if (type === "GENERAL") {
    await prisma.notice.create({
      data: {
        companyId: admin.companyId,
        authorId: admin.id,
        type: "GENERAL",
        title,
        message,
        targetUserId: null,
      },
    });
  } else {
    if (!targetUserId) fail("Selecione o servidor que receberá o aviso.");

    const error = validateTermination(lastWorkingDayISO);
    if (error) fail(error);

    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target || target.companyId !== admin.companyId || target.role !== "EMPLOYEE") {
      fail("Servidor não encontrado nesta instituição.");
    }

    await prisma.notice.create({
      data: {
        companyId: admin.companyId,
        authorId: admin.id,
        type: "TERMINATION",
        title,
        message,
        targetUserId: target.id,
        lastWorkingDay: isoToDate(lastWorkingDayISO),
      },
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/avisos");
  revalidatePath("/admin/funcionarios");
  revalidatePath("/app");
  revalidatePath("/app/avisos");

  redirect(`${PATH}?ok=${encodeURIComponent("Aviso publicado para o servidor.")}`);
}
