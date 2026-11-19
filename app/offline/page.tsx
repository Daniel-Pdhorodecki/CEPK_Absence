import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Sem conexão",
  description: "Você está offline. Verifique sua conexão e tente novamente.",
};

export default function OfflinePage() {
  return (
    <div className="auth-bg flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      <div className="card w-full max-w-md text-center">
        <BrandMark className="mx-auto size-14" />
        <p className="eyebrow mt-6">CEPK Absence</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text)]">
          Você está sem conexão
        </h1>
        <p className="mt-3 helper">
          O aplicativo continua instalado no seu celular. Verifique o Wi-Fi ou os
          dados móveis e tente novamente.
        </p>
        <div className="mt-7 flex flex-col gap-2">
          <Link href="/" className="btn-primary w-full">
            Tentar novamente
          </Link>
          <Link href="/login" className="btn-secondary w-full">
            Ir para o login
          </Link>
        </div>
        <p className="mt-6 text-xs text-[var(--muted-2)]">
          Suas solicitações continuam salvas no servidor.
        </p>
      </div>
    </div>
  );
}
