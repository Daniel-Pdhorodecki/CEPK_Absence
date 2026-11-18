import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { addDaysISO, isoToDate, todayISO } from "../lib/dates";

const prisma = new PrismaClient();
const INSTITUTION_NAME = "Colégio Estadual P. Kennedy";

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "pedagoga@escola.pr.gov.br" },
  });
  if (existing) {
    console.log("Seed já aplicado. Nada a fazer.");
    return;
  }

  const passwordHash = await bcrypt.hash("123456", 10);
  const today = todayISO();

  const institution = await prisma.company.create({
    data: { name: INSTITUTION_NAME },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Pedagoga (Administração)",
      email: "pedagoga@escola.pr.gov.br",
      passwordHash,
      role: "ADMIN",
      staffType: "FUNCIONARIO",
      position: "Pedagoga",
      status: "APPROVED",
      companyId: institution.id,
    },
  });

  const teacher = await prisma.user.create({
    data: {
      name: "Professor Exemplo",
      email: "professor@escola.pr.gov.br",
      passwordHash,
      role: "EMPLOYEE",
      staffType: "PROFESSOR",
      status: "APPROVED",
      companyId: institution.id,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Funcionário Exemplo",
      email: "funcionario@escola.pr.gov.br",
      passwordHash,
      role: "EMPLOYEE",
      staffType: "FUNCIONARIO",
      position: "Monitor",
      status: "APPROVED",
      companyId: institution.id,
    },
  });

  await prisma.user.create({
    data: {
      name: "Cadastro Pendente",
      email: "pendente@escola.pr.gov.br",
      passwordHash,
      role: "EMPLOYEE",
      staffType: "FUNCIONARIO",
      position: "Limpeza",
      status: "PENDING",
      companyId: institution.id,
    },
  });

  await prisma.absenceRequest.create({
    data: {
      userId: staff.id,
      companyId: institution.id,
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
      userId: teacher.id,
      companyId: institution.id,
      startDate: isoToDate(addDaysISO(today, 35)),
      endDate: isoToDate(addDaysISO(today, 36)),
      shift: "AFTERNOON",
      kind: "COMMON",
      reason: "Compromisso pessoal.",
      status: "APPROVED",
      reviewedById: admin.id,
      reviewedAt: new Date(),
      reviewNote: "Aprovado pela administração (exemplo de demonstração).",
    },
  });

  await prisma.notice.create({
    data: {
      companyId: institution.id,
      authorId: admin.id,
      type: "GENERAL",
      title: "Boas-vindas ao CEPK Absence",
      message:
        "A partir de agora, solicite suas ausências por aqui. Pedidos comuns precisam de 30 dias de antecedência; faltas médicas exigem comprovante e passam pela análise da administração.",
    },
  });

  console.log("Seed concluído.");
  console.log("Admin:      pedagoga@escola.pr.gov.br / 123456");
  console.log("Professor:  professor@escola.pr.gov.br / 123456");
  console.log("Funcionário: funcionario@escola.pr.gov.br / 123456");
  console.log("Pendente:   pendente@escola.pr.gov.br / 123456");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
