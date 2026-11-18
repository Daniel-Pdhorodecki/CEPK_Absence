import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(null, { status: 401 });
  }

  const logo = await prisma.companyLogo.findUnique({
    where: { companyId: user.companyId },
  });

  if (!logo) {
    return new Response(null, { status: 404 });
  }

  return new Response(new Uint8Array(logo.data), {
    headers: {
      "Content-Type": logo.type,
      "Cache-Control": "private, no-cache",
      ETag: `"${logo.updatedAt.getTime()}"`,
    },
  });
}
