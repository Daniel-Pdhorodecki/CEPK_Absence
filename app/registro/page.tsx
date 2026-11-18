import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AuthShell } from "@/components/AuthShell";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Criar conta" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "RH" ? "/rh" : "/app");

  return (
    <AuthShell
      wide
      title="Como você vai usar o CEPK Absence?"
      subtitle="Escolha o perfil para começar o cadastro."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="link">
            Entrar
          </Link>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/registro/funcionario"
          className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
        >
          <span className="grid size-11 place-items-center rounded-2xl border border-[var(--border-strong)] text-[var(--text)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-6"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Sou funcionário</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            Entro com o código da empresa para solicitar faltas e acompanhar avisos.
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-[var(--text)]">
            Continuar →
          </span>
        </Link>

        <Link
          href="/registro/rh"
          className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
        >
          <span className="grid size-11 place-items-center rounded-2xl border border-[var(--border-strong)] text-[var(--text)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-6"
              aria-hidden="true"
            >
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
            </svg>
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Sou do RH</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            Crio a empresa e gerencio códigos, solicitações, avisos e demissões.
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-[var(--text)]">
            Continuar →
          </span>
        </Link>
      </div>
    </AuthShell>
  );
}
