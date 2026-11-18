import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { registerEmployeeAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/AuthShell";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Cadastro de funcionário" };

export default async function EmployeeRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "RH" ? "/rh" : "/app");

  const { erro } = await searchParams;

  return (
    <AuthShell
      title="Cadastro de funcionário"
      subtitle="Peça o código da empresa ao seu RH."
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

      <form action={registerEmployeeAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="label">
            Nome completo
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
            autoComplete="email"
            required
            className="input"
            placeholder="voce@empresa.com"
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
            autoComplete="new-password"
            minLength={6}
            required
            className="input"
            placeholder="Mínimo de 6 caracteres"
          />
        </div>
        <div>
          <label htmlFor="companyCode" className="label">
            Código da empresa
          </label>
          <input
            id="companyCode"
            name="companyCode"
            required
            className="input font-mono uppercase tracking-widest"
            placeholder="EX.: ACME2026"
            maxLength={12}
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Código fornecido pelo RH (não é o código de RH).
          </p>
        </div>
        <button type="submit" className="btn-primary w-full">
          Criar conta
        </button>
      </form>
    </AuthShell>
  );
}
