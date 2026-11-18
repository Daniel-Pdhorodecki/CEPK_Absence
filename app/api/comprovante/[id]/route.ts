import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const { id } = await params;
  const absence = await prisma.absenceRequest.findUnique({ where: { id } });

  if (!absence?.proofData) {
    return new NextResponse("Comprovante não encontrado.", { status: 404 });
  }

  const canAccess =
    absence.userId === user.id ||
    (user.role === "RH" && absence.companyId === user.companyId);

  if (!canAccess) {
    return new NextResponse("Acesso negado.", { status: 403 });
  }

  const filename = (absence.proofName ?? "comprovante").replace(/"/g, "");

  return new NextResponse(new Uint8Array(absence.proofData), {
    headers: {
      "Content-Type": absence.proofType ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
