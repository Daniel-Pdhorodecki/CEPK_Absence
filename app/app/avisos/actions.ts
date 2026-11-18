"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";

export async function markAllNoticesRead(): Promise<void> {
  const user = await requireEmployee();

  const notices = await prisma.notice.findMany({
    where: {
      companyId: user.companyId,
      OR: [{ targetUserId: user.id }, { targetUserId: null, type: "GENERAL" }],
    },
    select: { id: true },
  });

  await Promise.all(
    notices.map((notice) =>
      prisma.noticeRead.upsert({
        where: { noticeId_userId: { noticeId: notice.id, userId: user.id } },
        create: { noticeId: notice.id, userId: user.id },
        update: {},
      }),
    ),
  );

  revalidatePath("/app");
  revalidatePath("/app/avisos");
  redirect("/app/avisos?ok=1");
}
