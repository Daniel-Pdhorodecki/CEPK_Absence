import { INSTITUTION_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

/** Instituição única do sistema (Colégio Estadual P. Kennedy). */
export async function getInstitution() {
  const existing = await prisma.company.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;
  return prisma.company.create({ data: { name: INSTITUTION_NAME } });
}
