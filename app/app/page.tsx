import Link from "next/link";
import type { Metadata } from "next";

import { KindBadge, StatusBadge } from "@/components/Badges";
import { SHIFT_LABELS } from "@/lib/constants";
import {
  dateToISO,
  formatDateBR,
  formatDateTimeBR,
  formatRangeBR,
  isoToDate,
  todayISO,
} from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";

export const metadata: Metadata = { title: "Início" };

export default async function EmployeeHomePage() {
  const user = await requireEmployee();
  const today = todayISO();

  const [absences, notices, termination] = await Promise.all([
    prisma.absenceRequest.findMany({
      where: { userId: user.id },
      orderBy: { startDate: "desc" },
      take: 20,
    }),
    prisma.notice.findMany({
      where: {
        companyId: user.companyId,
        OR: [{ targetUserId: user.id }, { targetUserId: null, type: "GENERAL" }],
      },
      include: { reads: { where: { userId: user.id } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notice.findFirst({
      where: { targetUserId: user.id, type: "TERMINATION" },
      orderBy: { lastWorkingDay: "desc" },
    }),
  ]);

  const pending = absences.filter((absence) => absence.status === "PENDING").length;
  const approved = absences.filter((absence) => absence.status === "APPROVED").length;
  const unread = notices.filter((notice) => notice.reads.length === 0).length;
  const nextAbsence = absences
    .filter(
      (absence) =>
        absence.status === "APPROVED" && dateToISO(absence.endDate) >= today,
    )
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0];

  const recent = absences.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Olá, {user.name.split(" ")[0]}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
          Seu painel de ausências
        </h1>
        <p className="mt-1.5 helper">
          Hoje é {formatDateBR(today)} · {user.company.name}
        </p>
      </div>

      {termination ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="badge bg-rose-100 text-rose-800">Aviso de demissão</span>
              <h2 className="mt-2 text-lg font-semibold text-rose-900">{termination.title}</h2>
              <p className="mt-1 text-sm text-rose-800">{termination.message}</p>
              {termination.lastWorkingDay ? (
                <p className="mt-2 text-sm font-semibold text-rose-900">
                  Último dia de trabalho: {formatDateBR(termination.lastWorkingDay)}
                </p>
              ) : null}
            </div>
            <Link href="/app/avisos" className="btn-secondary btn-sm border-rose-300 text-rose-800">
              Ver aviso
            </Link>
          </div>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/app/faltas?status=PENDING"
          className="card-tight group transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Pedidos pendentes
            </p>
            <span className="text-[var(--muted-2)] transition group-hover:translate-x-0.5 group-hover:text-[var(--text)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-amber-600">{pending}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Aguardando a administração</p>
        </Link>
        <Link
          href="/app/faltas?status=APPROVED"
          className="card-tight group transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Faltas aprovadas
            </p>
            <span className="text-[var(--muted-2)] transition group-hover:translate-x-0.5 group-hover:text-[var(--text)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">{approved}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Histórico na instituição</p>
        </Link>
        <Link
          href="/app/avisos"
          className="card-tight group transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Avisos não lidos
            </p>
            <span className="text-[var(--muted-2)] transition group-hover:translate-x-0.5 group-hover:text-[var(--text)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-[var(--text)]">{unread}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Comunicados da administração</p>
        </Link>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-title">Próxima ausência</h2>
            <Link href="/app/solicitar" className="btn-primary btn-sm">
              + Solicitar
            </Link>
          </div>

          {nextAbsence ? (
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={nextAbsence.status} />
                <KindBadge kind={nextAbsence.kind} />
                <span className="badge bg-[var(--surface-3)] text-[var(--muted)]">
                  {SHIFT_LABELS[nextAbsence.shift] ?? nextAbsence.shift}
                </span>
              </div>
              <p className="mt-3 text-lg font-semibold text-[var(--text)]">
                {formatRangeBR(dateToISO(nextAbsence.startDate), dateToISO(nextAbsence.endDate))}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">{nextAbsence.reason}</p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] p-6 text-center">
              <p className="text-sm font-medium text-[var(--muted)]">
                Nenhuma ausência aprovada pela frente.
              </p>
              <p className="mt-1 text-xs text-[var(--muted-2)]">
                Pedidos comuns precisam de 30 dias de antecedência.
              </p>
            </div>
          )}

          <h3 className="mt-6 text-sm font-semibold text-[var(--text)]">Últimos pedidos</h3>
          <div className="mt-2 divide-y divide-[var(--border)]">
            {recent.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">Você ainda não fez nenhum pedido.</p>
            ) : (
              recent.map((absence) => (
                <div key={absence.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {formatRangeBR(dateToISO(absence.startDate), dateToISO(absence.endDate))}
                    </p>
                    <p className="text-xs text-slate-500">
                      {SHIFT_LABELS[absence.shift] ?? absence.shift} ·{" "}
                      {formatDateTimeBR(absence.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={absence.status} />
                </div>
              ))
            )}
          </div>
          <Link href="/app/faltas" className="link mt-3 inline-flex text-sm">
            Ver todas as solicitações →
          </Link>
        </section>

        <section className="card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-title">Avisos</h2>
            <Link href="/app/avisos" className="link text-sm">
              Ver todos
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {notices.slice(0, 3).map((notice) => (
              <Link
                key={notice.id}
                href="/app/avisos"
                className="block rounded-xl border border-[var(--border)] p-4 transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
              >
                <div className="flex items-center gap-2">
                  {notice.type === "TERMINATION" ? (
                    <span className="badge bg-rose-100 text-rose-800">Demissão</span>
                  ) : (
                    <span className="badge bg-[var(--surface-3)] text-[var(--muted)]">
                      Comunicado
                    </span>
                  )}
                  {notice.reads.length === 0 ? (
                    <span className="badge bg-amber-100 text-amber-800">Novo</span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-800">{notice.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {notice.message}
                </p>
              </Link>
            ))}
            {notices.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Nenhum aviso por enquanto.
              </p>
            ) : null}
          </div>

          <div className="panel-inverse mt-5 p-4">
            <p className="text-sm font-semibold">Falta médica?</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              Consulta, dentista e outros cuidados de saúde exigem comprovante e
              passam pela análise da administração.
            </p>
            <Link href="/app/solicitar" className="btn-inverse mt-3">
              Registrar falta médica
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
