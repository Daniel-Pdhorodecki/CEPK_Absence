/**
 * Converte o schema do protótipo (SQLite) para PostgreSQL no build do Render.
 * Usado apenas no deploy; localmente o schema continua SQLite.
 *
 * O banco de produção fica no Neon:
 * - DATABASE_URL: conexão pooled usada pela aplicação;
 * - DIRECT_URL: conexão direta usada pelo `prisma db push`.
 */
import { readFileSync, writeFileSync } from "node:fs";

const path = new URL("../prisma/schema.prisma", import.meta.url);
const original = readFileSync(path, "utf8");

let updated = original.replace(
  'provider = "sqlite"',
  'provider = "postgresql"',
);

if (!updated.includes("directUrl")) {
  updated = updated.replace(
    /url(\s*)= env\("DATABASE_URL"\)/,
    'url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")',
  );
}

if (updated === original) {
  console.log("Schema já está configurado para PostgreSQL (Neon).");
} else {
  writeFileSync(path, updated);
  console.log("Schema convertido para PostgreSQL (Neon).");
}
