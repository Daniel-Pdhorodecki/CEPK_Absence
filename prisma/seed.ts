import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { addDaysISO, isoToDate, todayISO } from "../lib/dates";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: "rh@demo.com" } });
  if (existing) {
    console.log("Seed já aplicado. Nada a fazer.");
    return;
  }

  const passwordHash = await bcrypt.hash("123456", 10);
  const today = todayISO();

  const company = await prisma.company.create({
    data: {
      name: "Acme Tecnologia Ltda",
      employeeCode: "ACME2026",
      rhCode: "RHACME26",
    },
  });

  const rh = await prisma.user.create({
    data: {
      name: "Renata (RH)",
      email: "rh@demo.com",
      passwordHash,
      role: "RH",
      isOwner: true,
      companyId: company.id,
    },
  });

  await prisma.company.update({
    where: { id: company.id },
    data: { ownerId: rh.id },
  });

  const employee = await prisma.user.create({
    data: {
      name: "Carlos Andrade",
      email: "funcionario@demo.com",
      passwordHash,
      role: "EMPLOYEE",
      companyId: company.id,
    },
  });

  await prisma.user.create({
    data: {
      name: "Marina Souza",
      email: "marina@demo.com",
      passwordHash,
      role: "EMPLOYEE",
      companyId: company.id,
    },
  });

  await prisma.absenceRequest.create({
    data: {
      userId: employee.id,
      companyId: company.id,
      startDate: isoToDate(addDaysISO(today, -10)),
      endDate: isoToDate(addDaysISO(today, -10)),
      shift: "MORNING",
      kind: "MEDICAL",
      reason: "Consulta odontológica de rotina.",
      proofName: "atestado-exemplo.txt",
      proofType: "text/plain",
      proofData: new TextEncoder().encode("Comprovante de exemplo (seed)."),
      status: "PENDING",
      autoApproved: false,
    },
  });

  await prisma.absenceRequest.create({
    data: {
      userId: employee.id,
      companyId: company.id,
      startDate: isoToDate(addDaysISO(today, 35)),
      endDate: isoToDate(addDaysISO(today, 36)),
      shift: "AFTERNOON",
      kind: "COMMON",
      reason: "Viagem em família.",
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewNote: "Aprovado pelo RH (exemplo de demonstração).",
    },
  });

  await prisma.notice.create({
    data: {
      companyId: company.id,
      authorId: rh.id,
      type: "GENERAL",
      title: "Boas-vindas ao CEPK Absence",
      message:
        "A partir de agora, solicite suas folgas por aqui. Pedidos comuns precisam de 30 dias de antecedência; faltas médicas exigem comprovante e passam pela análise do RH.",
    },
  });

  console.log("Seed concluído.");
  console.log("RH:         rh@demo.com / 123456");
  console.log("Funcionário: funcionario@demo.com / 123456");
  console.log(`Código de funcionário: ${company.employeeCode}`);
  console.log(`Código de RH:          ${company.rhCode}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
