import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(null, { status: 401 });
  }

  const { id } = await params;

  const target = await prisma.user.findUnique({
    where: { id },
    select: { companyId: true, hasAvatar: true },
  });

  if (!target || target.companyId !== user.companyId || !target.hasAvatar) {
    return new Response(null, { status: 404 });
  }

  const avatar = await prisma.userAvatar.findUnique({ where: { userId: id } });
  if (!avatar) {
    return new Response(null, { status: 404 });
  }

  return new Response(new Uint8Array(avatar.data), {
    headers: {
      "Content-Type": avatar.type,
      "Cache-Control": "private, no-cache",
      ETag: `"${avatar.updatedAt.getTime()}"`,
    },
  });
}
