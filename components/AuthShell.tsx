import Link from "next/link";

import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="auth-bg flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/"
            className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--text)]"
          >
            Voltar ao início
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-5 pb-20 pt-4 sm:pt-10">
        <div className={`w-full ${wide ? "max-w-3xl" : "max-w-md"}`}>
          <div className="card p-7 sm:p-9">
            <p className="eyebrow">CEPK Absence</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text)]">
              {title}
            </h1>
            {subtitle ? <p className="mt-2 helper">{subtitle}</p> : null}
            <div className="mt-7">{children}</div>
          </div>
          {footer ? (
            <div className="mt-6 text-center text-sm text-[var(--muted)]">{footer}</div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
