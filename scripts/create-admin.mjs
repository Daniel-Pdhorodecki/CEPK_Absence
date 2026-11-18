// Cria (ou atualiza) o primeiro usuário administrador do CEPK Absence.
// Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run db:create-admin
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const INSTITUTION_NAME = "Colégio Estadual P. Kennedy";
const EMAIL_DOMAIN = "escola.pr.gov.br";

async function main() {
  const email = String(process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD ?? "");
  const name = String(process.env.ADMIN_NAME ?? "Administração").trim();

  if (!email.endsWith(`@${EMAIL_DOMAIN}`)) {
    throw new Error(`ADMIN_EMAIL precisa terminar em @${EMAIL_DOMAIN}.`);
  }
  if (password.length < 6) {
    throw new Error("ADMIN_PASSWORD precisa ter pelo menos 6 caracteres.");
  }

  const institution =
    (await prisma.company.findFirst({ orderBy: { createdAt: "asc" } })) ??
    (await prisma.company.create({ data: { name: INSTITUTION_NAME } }));

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
      staffType: "FUNCIONARIO",
      position: "Administração",
      status: "APPROVED",
      companyId: institution.id,
    },
    update: {
      name,
      passwordHash,
      role: "ADMIN",
      status: "APPROVED",
      companyId: institution.id,
    },
  });

  console.log(`Administrador pronto: ${user.email} (${user.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
