import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { registerCompanyAction, registerRhAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/AuthShell";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Cadastro de RH" };

export default async function RhRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "RH" ? "/rh" : "/app");

  const { erro } = await searchParams;

  return (
    <AuthShell
      wide
      title="Cadastro de RH"
      subtitle="Crie uma nova empresa ou entre com o código de RH de uma empresa existente."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="link">
            Entrar
          </Link>
        </>
      }
    >
      {erro ? <div className="alert-error mb-5">{erro}</div> : null}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
          <div className="flex items-center gap-2">
            <span className="badge bg-[var(--btn-bg)] text-[var(--btn-fg)]">Primeiro RH</span>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">Criar empresa</h2>
          <p className="mt-1 text-sm text-slate-600">
            Você será o responsável e receberá os códigos de funcionário e de RH.
          </p>

          <form action={registerCompanyAction} className="mt-4 space-y-3.5">
            <div>
              <label htmlFor="companyName" className="label">
                Nome da empresa
              </label>
              <input
                id="companyName"
                name="companyName"
                required
                className="input"
                placeholder="Acme Ltda"
              />
            </div>
            <div>
              <label htmlFor="companyLogo" className="label">
                Logo da empresa <span className="text-[var(--muted-2)]">(opcional)</span>
              </label>
              <input
                id="companyLogo"
                name="logo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="input file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[var(--btn-bg)] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[var(--btn-fg)]"
              />
              <p className="mt-1.5 text-xs text-[var(--muted)]">
                JPG, PNG ou WebP até 2 MB. Você pode trocar depois em “Empresa e códigos”.
              </p>
            </div>
            <div>
              <label htmlFor="name" className="label">
                Seu nome
              </label>
              <input id="name" name="name" required className="input" placeholder="Seu nome" />
            </div>
            <div>
              <label htmlFor="email" className="label">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="rh@empresa.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="label">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={6}
                required
                className="input"
                placeholder="Mínimo de 6 caracteres"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Criar empresa e conta
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
          <div className="flex items-center gap-2">
            <span className="badge border border-[var(--border-strong)] text-[var(--muted)]">
              Equipe de RH
            </span>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">Entrar em uma empresa</h2>
          <p className="mt-1 text-sm text-slate-600">
            Use o <strong>código de RH</strong> compartilhado pelo responsável da empresa.
          </p>

          <form action={registerRhAction} className="mt-4 space-y-3.5">
            <div>
              <label htmlFor="rhCode" className="label">
                Código de RH
              </label>
              <input
                id="rhCode"
                name="rhCode"
                required
                className="input font-mono uppercase tracking-widest"
                placeholder="EX.: RHACME26"
                maxLength={12}
              />
            </div>
            <div>
              <label htmlFor="join-name" className="label">
                Seu nome
              </label>
              <input id="join-name" name="name" required className="input" placeholder="Seu nome" />
            </div>
            <div>
              <label htmlFor="join-email" className="label">
                E-mail
              </label>
              <input
                id="join-email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="rh@empresa.com"
              />
            </div>
            <div>
              <label htmlFor="join-password" className="label">
                Senha
              </label>
              <input
                id="join-password"
                name="password"
                type="password"
                minLength={6}
                required
                className="input"
                placeholder="Mínimo de 6 caracteres"
              />
            </div>
            <button type="submit" className="btn-secondary w-full">
              Entrar com código de RH
            </button>
          </form>
        </section>
      </div>
    </AuthShell>
  );
}
