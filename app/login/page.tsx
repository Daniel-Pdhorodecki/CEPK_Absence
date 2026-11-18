import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AuthShell } from "@/components/AuthShell";
import { loginAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/app");

  const { erro } = await searchParams;

  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse com o e-mail e a senha cadastrados."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href="/registro" className="link">
            Cadastre-se
          </Link>
        </>
      }
    >
      {erro ? <div className="alert-error mb-5">{erro}</div> : null}

      <form action={loginAction} className="space-y-4">
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
            placeholder="voce@escola.pr.gov.br"
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
            autoComplete="current-password"
            required
            className="input"
            placeholder="Sua senha"
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          Entrar
        </button>
      </form>
    </AuthShell>
  );
}
