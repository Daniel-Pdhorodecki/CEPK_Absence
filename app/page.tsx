import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/session";
import { InstallAppButton } from "@/components/InstallAppButton";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = { title: "Início" };

const features = [
  {
    title: "Solicite sua folga",
    description:
      "Escolha o período no calendário, o turno e o motivo. Faltas comuns exigem 30 dias de antecedência.",
    icon: "M8 2v4M16 2v4M3 9h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  },
  {
    title: "Falta médica com comprovante",
    description:
      "Consulta, dentista ou qualquer cuidado com a saúde: anexe o comprovante e acompanhe a análise da administração.",
    icon: "M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z",
  },
  {
    title: "Administração no controle",
    description:
      "A administração escolar aprova cadastros, analisa pedidos e publica avisos para toda a equipe.",
    icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87",
  },
];

const steps = [
  {
    number: "01",
    title: "O servidor pede",
    description: "Escolhe o período no calendário, informa o turno e o motivo.",
  },
  {
    number: "02",
    title: "A administração analisa",
    description:
      "Todo pedido entra como pendente. A administração confere, inclusive os comprovantes médicos.",
  },
  {
    number: "03",
    title: "Todos acompanham",
    description: "A decisão aparece na hora no painel do servidor, com histórico.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/app");

  return (
    <div className="page-bg min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--page)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4">
          <span className="hidden sm:inline-flex">
            <Logo />
          </span>
          <span className="sm:hidden">
            <Logo compact />
          </span>

          <nav className="mx-auto hidden items-center gap-1 text-sm md:flex">
            {[
              { href: "#recursos", label: "Recursos" },
              { href: "#como-funciona", label: "Como funciona" },
              { href: "#seguranca", label: "Segurança" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <span className="sm:hidden">
              <InstallAppButton />
            </span>
            <span className="hidden sm:inline-flex">
              <InstallAppButton variant="full" />
            </span>
            <ThemeToggle />
            <Link href="/login" className="btn-ghost btn-sm hidden sm:inline-flex">
              Entrar
            </Link>
            <Link href="/registro" className="btn-primary btn-sm">
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 0%, rgba(132,204,22,0.18), transparent 45%), radial-gradient(circle at 85% 20%, rgba(20,83,45,0.16), transparent 40%)",
            }}
          />
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-14 pt-10 sm:px-5 sm:pb-16 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-24 lg:pt-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-3.5 py-1.5 text-xs font-medium text-[var(--muted)]">
                <span className="size-1.5 rounded-full bg-[var(--accent-lime)]" />
                Faltas, folgas e avisos em um só lugar
              </span>

              <h1 className="mt-7 text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--text)] sm:text-6xl lg:text-[4.25rem]">
                Ausências organizadas{" "}
                <span className="text-[#4d7c0f] dark:text-[#a3e635]">
                  sem planilhas.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
                O servidor solicita pelo calendário, a administração analisa cada
                pedido e todos acompanham a decisão. Faltas médicas também passam
                pela aprovação da administração.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/registro" className="btn-primary px-7 py-3.5 text-base">
                  Começar agora
                </Link>
                <Link href="/login" className="btn-secondary px-7 py-3.5 text-base">
                  Já tenho conta
                </Link>
                <InstallAppButton
                  variant="full"
                  className="min-h-[3.05rem] px-6 text-base"
                />
              </div>

              <p className="mt-5 text-sm text-[var(--muted-2)]">
                Instale na tela inicial do celular e use como um aplicativo. Todo
                cadastro passa pela aprovação da administração.
              </p>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-[var(--text)] opacity-[0.04] blur-2xl"
              />
              <div className="overflow-hidden rounded-[1.75rem] border border-[#a3e635]/20 bg-gradient-to-br from-[#12371f] to-[#08160d] text-white shadow-2xl shadow-[#14532d]/30">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a3e635]/80">
                      Painel da administração
                    </p>
                    <p className="mt-1 text-base font-semibold">Solicitações</p>
                  </div>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] font-medium text-white/70">
                    Outubro
                  </span>
                </div>

                <div className="space-y-5 p-6">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="grid grid-cols-7 gap-1.5 text-center text-[11px]">
                      {["D", "S", "T", "Q", "Q", "S", "S"].map((day, index) => (
                        <span key={`${day}-${index}`} className="py-1 text-white/35">
                          {day}
                        </span>
                      ))}
                      {Array.from({ length: 21 }).map((_, index) => {
                        const highlighted = [9, 10, 11].includes(index);
                        return (
                          <span
                            key={index}
                            className={`grid aspect-square place-items-center rounded-lg ${
                              highlighted
                                ? "bg-[#a3e635] font-semibold text-[#0b1a11]"
                                : "text-white/45"
                            }`}
                          >
                            {index + 1}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-full bg-white/10 text-xs font-semibold">
                          LM
                        </span>
                        <div>
                          <p className="text-sm font-medium">Lucas Martins</p>
                          <p className="text-[11px] text-white/45">09–11 · Manhã</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-semibold text-amber-300">
                        Pendente
                      </span>
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-white/50">
                      Falta médica · comprovante anexado · aguardando análise da administração
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-full bg-white/10 text-xs font-semibold">
                          AR
                        </span>
                        <div>
                          <p className="text-sm font-medium">Ana Ribeiro</p>
                          <p className="text-[11px] text-white/45">21–22 · Tarde</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold text-[#bef264]">
                        Aprovada
                      </span>
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-white/50">
                      Folga comum · aprovada pela administração
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="recursos"
          className="border-t border-[var(--border)] bg-[var(--surface)]"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Recursos</p>
                <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
                  Tudo o que a equipe precisa, em um só painel.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)]">
                Sem planilhas paralelas, sem pedidos perdidos no chat e sem
                aprovação automática de atestados.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="card">
                  <span className="grid size-11 place-items-center rounded-2xl border border-[var(--border-strong)] text-[var(--text)]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5"
                      aria-hidden="true"
                    >
                      <path d={feature.icon} />
                    </svg>
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-[var(--text)]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto w-full max-w-6xl px-5 py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="eyebrow">Como funciona</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
                Do pedido à decisão, sem atrito.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
                Um fluxo simples para o servidor e transparente para a administração.
                Todo pedido entra como pendente e só muda de status após a análise.
              </p>
            </div>

            <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="grid gap-3 py-6 sm:grid-cols-[3rem_1fr] sm:gap-6"
                >
                  <span className="text-sm font-semibold text-[var(--muted-2)]">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text)]">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="seguranca" className="border-t border-[var(--border)]">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <p className="eyebrow">Segurança e transparência</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
                Nenhuma falta é aprovada sozinha.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
                Faltas médicas exigem comprovante e passam pela conferência da
                administração, como qualquer outro pedido. O histórico registra quem
                analisou e quando, e o servidor acompanha cada mudança de status.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/registro" className="btn-primary">
                  Criar conta
                </Link>
                <Link href="/login" className="btn-secondary">
                  Entrar
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "Comprovante obrigatório",
                  text: "JPG, PNG ou PDF de até 5 MB para faltas médicas.",
                },
                {
                  title: "Revisão humana",
                  text: "A administração aprova ou reprova com observação registrada.",
                },
                {
                  title: "Janela de datas",
                  text: "Até 30 dias retroativos e 365 dias futuros para consultas.",
                },
                {
                  title: "Cadastro aprovado",
                  text: "Novos professores e funcionários entram pendentes até a aprovação da administração.",
                },
              ].map((item) => (
                <div key={item.title} className="card-tight">
                  <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-[var(--muted)] sm:flex-row">
          <p>CEPK Absence · Colégio Kennedy</p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="transition hover:text-[var(--text)]">
              Entrar
            </Link>
            <Link href="/registro" className="transition hover:text-[var(--text)]">
              Criar conta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
