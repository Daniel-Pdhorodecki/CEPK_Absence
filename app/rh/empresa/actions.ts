"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { generateCompanyCode } from "@/lib/constants";
import { parseImageUpload } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { requireRH } from "@/lib/session";

const PATH = "/rh/empresa";

function fail(message: string): never {
  redirect(`${PATH}?erro=${encodeURIComponent(message)}`);
}

export async function regenerateCodeAction(formData: FormData): Promise<void> {
  const rh = await requireRH();
  const target = String(formData.get("target") ?? "");

  if (!rh.isOwner) {
    fail("Apenas o responsável pela empresa pode gerar novos códigos.");
  }
  if (target !== "employee" && target !== "rh") {
    fail("Código inválido.");
  }

  let code = "";
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = generateCompanyCode(target === "rh" ? "RH" : "");
    const exists = await prisma.company.findFirst({
      where: {
        id: { not: rh.companyId },
        OR: [{ employeeCode: candidate }, { rhCode: candidate }],
      },
      select: { id: true },
    });
    if (!exists) {
      code = candidate;
      break;
    }
  }

  if (!code) fail("Não foi possível gerar um código único. Tente novamente.");

  await prisma.company.update({
    where: { id: rh.companyId },
    data: target === "employee" ? { employeeCode: code } : { rhCode: code },
  });

  revalidatePath("/rh");
  revalidatePath("/rh/empresa");

  redirect(
    `${PATH}?ok=${encodeURIComponent(
      target === "employee"
        ? "Novo código de funcionário gerado. O anterior deixou de funcionar."
        : "Novo código de RH gerado. O anterior deixou de funcionar.",
    )}`,
  );
}

export async function uploadCompanyLogoAction(formData: FormData): Promise<void> {
  const rh = await requireRH();
  const { image, error } = await parseImageUpload(formData.get("logo"));

  if (error) fail(error);
  if (!image) fail("Selecione uma imagem para enviar.");

  await prisma.$transaction([
    prisma.companyLogo.upsert({
      where: { companyId: rh.companyId },
      create: { companyId: rh.companyId, data: image.data, type: image.type },
      update: { data: image.data, type: image.type },
    }),
    prisma.company.update({
      where: { id: rh.companyId },
      data: { hasLogo: true },
    }),
  ]);

  revalidatePath("/rh", "layout");
  revalidatePath("/app", "layout");
  revalidatePath("/rh/empresa");

  redirect(`${PATH}?ok=${encodeURIComponent("Logo da empresa atualizada.")}`);
}

export async function removeCompanyLogoAction(): Promise<void> {
  const rh = await requireRH();

  await prisma.$transaction([
    prisma.companyLogo.deleteMany({ where: { companyId: rh.companyId } }),
    prisma.company.update({
      where: { id: rh.companyId },
      data: { hasLogo: false },
    }),
  ]);

  revalidatePath("/rh", "layout");
  revalidatePath("/app", "layout");
  revalidatePath("/rh/empresa");

  redirect(`${PATH}?ok=${encodeURIComponent("Logo da empresa removida.")}`);
}
