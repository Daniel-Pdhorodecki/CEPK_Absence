import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "@/components/RegisterForm";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Criar conta" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; enviado?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/app");

  const { erro, enviado } = await searchParams;

  return (
    <AuthShell
      wide
      title={enviado ? "Cadastro enviado" : "Criar conta"}
      subtitle={
        enviado
          ? "Seu cadastro foi enviado para a administração da escola. Você poderá entrar assim que for aprovado."
          : "Use seu e-mail institucional. Todo cadastro passa pela aprovação da administração."
      }
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

      {enviado ? (
        <div className="space-y-4">
          <div className="alert-success">
            Cadastro recebido com sucesso. Aguarde a aprovação da administração
            (pedagogia) para acessar o sistema.
          </div>
          <Link href="/login" className="btn-primary w-full">
            Ir para o login
          </Link>
        </div>
      ) : (
        <RegisterForm />
      )}
    </AuthShell>
  );
}
