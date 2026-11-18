import Link from "next/link";
import type { Metadata } from "next";

import { KindBadge, StatusBadge } from "@/components/Badges";
import { cancelAbsenceRequest } from "@/app/app/solicitar/actions";
import { SHIFT_LABELS } from "@/lib/constants";
import {
  dateToISO,
  formatDateBR,
  formatDateTimeBR,
  formatRangeBR,
} from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";

export const metadata: Metadata = { title: "Minhas faltas" };

const FILTERS = [
  { value: "ALL", label: "Todas" },
  { value: "PENDING", label: "Pendentes" },
  { value: "APPROVED", label: "Aprovadas" },
  { value: "REJECTED", label: "Reprovadas" },
] as const;

const EMPTY_MESSAGES: Record<string, { title: string; text: string }> = {
  ALL: {
    title: "Nenhuma solicitação ainda.",
    text: "Quando você pedir uma falta, ela aparece aqui com o status do RH.",
  },
  PENDING: {
    title: "Nenhum pedido pendente.",
    text: "Você não tem solicitações aguardando análise do RH.",
  },
  APPROVED: {
    title: "Nenhuma falta aprovada ainda.",
    text: "As faltas aprovadas pelo RH aparecem aqui.",
  },
  REJECTED: {
    title: "Nenhuma falta reprovada.",
    text: "Pedidos reprovados pelo RH aparecem aqui com a observação.",
  },
};

export default async function MyAbsencesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; ok?: string; erro?: string }>;
}) {
  const user = await requireEmployee();
  const { status: statusParam, ok, erro } = await searchParams;

  const status = FILTERS.some((filter) => filter.value === statusParam)
    ? statusParam!
    : "ALL";

  const [absences, grouped] = await Promise.all([
    prisma.absenceRequest.findMany({
      where: {
        userId: user.id,
        ...(status === "ALL" ? {} : { status }),
      },
      include: { reviewedBy: { select: { name: true } } },
      orderBy: { startDate: "desc" },
    }),
    prisma.absenceRequest.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: { _all: true },
    }),
  ]);

  const counts: Record<string, number> = { ALL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 };
  for (const group of grouped) {
    counts[group.status] = group._count._all;
    counts.ALL += group._count._all;
  }

  const empty = EMPTY_MESSAGES[status] ?? EMPTY_MESSAGES.ALL;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Histórico</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
            Minhas faltas
          </h1>
          <p className="mt-2 helper">Acompanhe o status de cada solicitação.</p>
        </div>
        <Link href="/app/solicitar" className="btn-primary btn-sm">
          + Nova solicitação
        </Link>
      </div>

      {ok ? <div className="alert-success">{ok}</div> : null}
      {erro ? <div className="alert-error">{erro}</div> : null}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={`/app/faltas?status=${filter.value}`}
            className={`filter-pill ${status === filter.value ? "filter-pill-active" : ""}`}
          >
            {filter.label}
            <span className="filter-count">
              {counts[filter.value] ?? 0}
            </span>
          </Link>
        ))}
      </div>

      {absences.length === 0 ? (
        <div className="card text-center">
          <p className="font-medium text-slate-700">{empty.title}</p>
          <p className="mt-1 text-sm text-slate-500">{empty.text}</p>
          <Link href="/app/solicitar" className="btn-primary mt-4">
            Nova solicitação
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {absences.map((absence) => {
            const startISO = dateToISO(absence.startDate);
            const endISO = dateToISO(absence.endDate);

            return (
              <article key={absence.id} className="card-tight">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={absence.status} />
                      <KindBadge kind={absence.kind} />
                      <span className="badge bg-[var(--surface-3)] text-[var(--muted)]">
                        {SHIFT_LABELS[absence.shift] ?? absence.shift}
                      </span>
                      {absence.autoApproved ? (
                        <span className="badge border border-[var(--border-strong)] text-[var(--muted)]">
                          Histórico
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-2.5 text-lg font-semibold text-slate-900">
                      {formatRangeBR(startISO, endISO)}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {absence.reason}
                    </p>
                  </div>

                  <div className="text-right text-xs text-slate-500">
                    <p>Solicitado em</p>
                    <p className="font-medium text-slate-700">
                      {formatDateTimeBR(absence.createdAt)}
                    </p>
                  </div>
                </div>

                {absence.proofName ? (
                  <a
                    href={`/api/comprovante/${absence.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="link mt-3 inline-flex items-center gap-1.5 text-xs"
                  >
                    Abrir comprovante ({absence.proofName})
                  </a>
                ) : null}

                {absence.reviewNote ? (
                  <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--muted)]">
                    <span className="font-semibold">Observação do RH:</span>{" "}
                    {absence.reviewNote}
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
                  <span>
                    {absence.status === "PENDING"
                      ? "Aguardando análise do RH"
                      : absence.reviewedBy
                        ? `Analisado por ${absence.reviewedBy.name}`
                        : absence.autoApproved
                          ? "Registro histórico (aprovado automaticamente)"
                          : "Análise concluída"}
                    {absence.reviewedAt
                      ? ` em ${formatDateBR(dateToISO(absence.reviewedAt))}`
                      : ""}
                  </span>

                  {absence.status === "PENDING" ? (
                    <form action={cancelAbsenceRequest}>
                      <input type="hidden" name="id" value={absence.id} />
                      <button className="text-xs font-semibold text-rose-600 hover:text-rose-700">
                        Cancelar pedido
                      </button>
                    </form>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
