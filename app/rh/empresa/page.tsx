import type { Metadata } from "next";

import { CopyButton } from "@/components/CopyButton";
import {
  regenerateCodeAction,
  removeCompanyLogoAction,
  uploadCompanyLogoAction,
} from "@/app/rh/empresa/actions";
import { formatDateTimeBR } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireRH } from "@/lib/session";

export const metadata: Metadata = { title: "Empresa e códigos" };

export default async function CompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const rh = await requireRH();
  const { ok, erro } = await searchParams;

  const [company, rhCount] = await Promise.all([
    prisma.company.findUnique({
      where: { id: rh.companyId },
    }),
    prisma.user.count({ where: { companyId: rh.companyId, role: "RH" } }),
  ]);

  const owner = company?.ownerId
    ? await prisma.user.findUnique({
        where: { id: company.ownerId },
        select: { name: true, email: true },
      })
    : null;

  if (!company) {
    return <div className="alert-error">Empresa não encontrada.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Configuração</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
          Empresa e códigos
        </h1>
        <p className="mt-2 helper">
          Compartilhe o código correto com cada público. Eles são diferentes de propósito.
        </p>
      </div>

      {ok ? <div className="alert-success">{ok}</div> : null}
      {erro ? <div className="alert-error">{erro}</div> : null}

      <section className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Empresa
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{company.name}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {rhCount} pessoa(s) no RH · criada em {formatDateTimeBR(company.createdAt)}
            </p>
          </div>
          {owner ? (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Responsável
              </p>
              <p className="mt-0.5 font-medium text-slate-800">{owner.name}</p>
              <p className="text-xs text-slate-500">{owner.email}</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Logo da empresa</h2>
        <p className="mt-1.5 helper">
          Aparece na sidebar de todos os usuários e no painel do RH. JPG, PNG ou WebP
          até 2 MB.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {company.hasLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/api/empresa/logo"
              alt={`Logo de ${company.name}`}
              className="size-20 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] object-contain p-2"
            />
          ) : (
            <span className="grid size-20 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] text-2xl font-semibold text-[var(--muted)]">
              {company.name.trim().charAt(0).toUpperCase()}
            </span>
          )}

          <div className="flex flex-1 flex-wrap items-end gap-3">
            <form action={uploadCompanyLogoAction} className="flex flex-wrap items-end gap-2">
              <div className="min-w-0">
                <label htmlFor="company-logo" className="label">
                  {company.hasLogo ? "Trocar logo" : "Adicionar logo"}
                </label>
                <input
                  id="company-logo"
                  name="logo"
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  className="input max-w-xs file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[var(--btn-bg)] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[var(--btn-fg)]"
                />
              </div>
              <button type="submit" className="btn-primary btn-sm">
                Salvar logo
              </button>
            </form>

            {company.hasLogo ? (
              <form action={removeCompanyLogoAction}>
                <button type="submit" className="btn-danger btn-sm">
                  Remover logo
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="card">
          <div className="flex items-center justify-between gap-2">
            <h2 className="section-title">Código de funcionário</h2>
            <span className="badge bg-[var(--surface-3)] text-[var(--muted)]">Equipe</span>
          </div>
          <p className="mt-1.5 helper">
            Use este código no cadastro de funcionários. Ele não dá acesso ao painel do RH.
          </p>
          <div className="mt-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-5 text-center font-mono text-2xl font-semibold tracking-[0.25em] text-[var(--text)]">
            {company.employeeCode}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton value={company.employeeCode} label="Copiar código" />
            {rh.isOwner ? (
              <form action={regenerateCodeAction}>
                <input type="hidden" name="target" value="employee" />
                <button className="btn-ghost btn-sm text-slate-500">Gerar novo</button>
              </form>
            ) : null}
          </div>
        </section>

        <section className="card">
          <div className="flex items-center justify-between gap-2">
            <h2 className="section-title">Código de RH</h2>
            <span className="badge border border-[var(--border-strong)] text-[var(--muted)]">
              Restrito
            </span>
          </div>
          <p className="mt-1.5 helper">
            Permite que outro membro do RH entre na empresa. Não compartilhe com
            funcionários.
          </p>
          <div className="mt-4 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-5 text-center font-mono text-2xl font-semibold tracking-[0.25em] text-[var(--text)]">
            {company.rhCode}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <CopyButton value={company.rhCode} label="Copiar código" />
            {rh.isOwner ? (
              <form action={regenerateCodeAction}>
                <input type="hidden" name="target" value="rh" />
                <button className="btn-ghost btn-sm text-slate-500">Gerar novo</button>
              </form>
            ) : null}
          </div>
        </section>
      </div>

      {!rh.isOwner ? (
        <div className="alert-info">
          Você entrou com o código de RH. Apenas o responsável pela empresa pode gerar novos
          códigos.
        </div>
      ) : (
        <div className="alert-warning">
          Ao gerar um novo código, o anterior deixa de funcionar imediatamente. Quem já tem
          conta continua com acesso normal.
        </div>
      )}
    </div>
  );
}
