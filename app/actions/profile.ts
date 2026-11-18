"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseImageUpload } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

function profilePath(role: string): string {
  return role === "RH" ? "/rh/perfil" : "/app/perfil";
}

function fail(role: string, message: string): never {
  redirect(`${profilePath(role)}?erro=${encodeURIComponent(message)}`);
}

function revalidateProfile(): void {
  revalidatePath("/app", "layout");
  revalidatePath("/rh", "layout");
  revalidatePath("/app/perfil");
  revalidatePath("/rh/perfil");
}

export async function uploadAvatarAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const { image, error } = await parseImageUpload(formData.get("avatar"));

  if (error) fail(user.role, error);
  if (!image) fail(user.role, "Selecione uma imagem para enviar.");

  await prisma.$transaction([
    prisma.userAvatar.upsert({
      where: { userId: user.id },
      create: { userId: user.id, data: image.data, type: image.type },
      update: { data: image.data, type: image.type },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { hasAvatar: true },
    }),
  ]);

  revalidateProfile();
  redirect(
    `${profilePath(user.role)}?ok=${encodeURIComponent("Foto de perfil atualizada.")}`,
  );
}

export async function removeAvatarAction(): Promise<void> {
  const user = await requireUser();

  await prisma.$transaction([
    prisma.userAvatar.deleteMany({ where: { userId: user.id } }),
    prisma.user.update({
      where: { id: user.id },
      data: { hasAvatar: false },
    }),
  ]);

  revalidateProfile();
  redirect(
    `${profilePath(user.role)}?ok=${encodeURIComponent("Foto de perfil removida.")}`,
  );
}
