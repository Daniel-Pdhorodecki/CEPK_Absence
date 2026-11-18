import Link from "next/link";
import type { Metadata } from "next";

import { KindBadge, StatusBadge } from "@/components/Badges";
import { reviewAbsenceAction } from "@/app/admin/solicitacoes/actions";
import { SHIFT_LABELS } from "@/lib/constants";
import {
  dateToISO,
  formatDateBR,
  formatDateTimeBR,
  formatRangeBR,
} from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Solicitações" };

const FILTERS = [
  { value: "PENDING", label: "Pendentes" },
  { value: "APPROVED", label: "Aprovadas" },
  { value: "REJECTED", label: "Reprovadas" },
  { value: "ALL", label: "Todas" },
];

export default async function RhAbsencesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; ok?: string; erro?: string }>;
}) {
  const rh = await requireAdmin();
  const { status: statusParam, ok, erro } = await searchParams;

  const status = FILTERS.some((filter) => filter.value === statusParam)
    ? statusParam!
    : "PENDING";

  const absences = await prisma.absenceRequest.findMany({
    where: {
      companyId: rh.companyId,
      ...(status === "ALL" ? {} : { status }),
    },
    include: {
      user: { select: { name: true, email: true } },
      reviewedBy: { select: { name: true } },
    },
    orderBy: [{ createdAt: "desc" }],
    take: 100,
  });

  const grouped = await prisma.absenceRequest.groupBy({
    by: ["status"],
    where: { companyId: rh.companyId },
    _count: { _all: true },
  });

  const counts: Record<string, number> = { ALL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 };
  for (const group of grouped) {
    counts[group.status] = group._count._all;
    counts.ALL += group._count._all;
  }

  const emptyMessage =
    status === "PENDING"
      ? "Nenhuma solicitação pendente."
      : status === "APPROVED"
        ? "Nenhuma falta aprovada ainda."
        : status === "REJECTED"
          ? "Nenhuma falta reprovada."
          : "Nenhuma solicitação recebida ainda.";

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Aprovações</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
          Solicitações
        </h1>
        <p className="mt-2 helper">
          Aprove, reprove e consulte o histórico de faltas da instituição.
        </p>
      </div>

      {ok ? <div className="alert-success">{ok}</div> : null}
      {erro ? <div className="alert-error">{erro}</div> : null}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/solicitacoes?status=${filter.value}`}
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
          <p className="font-medium text-slate-700">{emptyMessage}</p>
          <p className="mt-1 text-sm text-slate-500">
            Quando os servidores enviarem pedidos, eles aparecem aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {absences.map((absence) => {
            const startISO = dateToISO(absence.startDate);
            const endISO = dateToISO(absence.endDate);
            const isPending = absence.status === "PENDING";

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
                      {absence.user.name}
                    </h2>
                    <p className="text-sm font-medium text-slate-700">
                      {formatRangeBR(startISO, endISO)}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {absence.reason}
                    </p>
                  </div>

                  <div className="text-right text-xs text-slate-500">
                    <p>{absence.user.email}</p>
                    <p className="mt-1">Pedido em {formatDateTimeBR(absence.createdAt)}</p>
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
                    <span className="font-semibold">Observação:</span> {absence.reviewNote}
                  </div>
                ) : null}

                {!isPending ? (
                  <p className="mt-3 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
                    Analisado por {absence.reviewedBy?.name ?? "sistema"}
                    {absence.reviewedAt
                      ? ` em ${formatDateBR(absence.reviewedAt)}`
                      : ""}
                  </p>
                ) : (
                  <div className="mt-4 flex flex-wrap items-start gap-3 border-t border-[var(--border)] pt-3">
                    <form action={reviewAbsenceAction}>
                      <input type="hidden" name="id" value={absence.id} />
                      <input type="hidden" name="decision" value="APPROVE" />
                      <button className="btn-primary btn-sm">Aprovar</button>
                    </form>

                    <details className="grow">
                      <summary className="btn-secondary btn-sm inline-flex cursor-pointer list-none">
                        Reprovar
                      </summary>
                      <form
                        action={reviewAbsenceAction}
                        className="mt-3 space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-500/30 dark:bg-rose-500/10"
                      >
                        <input type="hidden" name="id" value={absence.id} />
                        <input type="hidden" name="decision" value="REJECT" />
                        <label htmlFor={`note-${absence.id}`} className="text-xs font-semibold text-rose-800">
                          Motivo da reprovação
                        </label>
                        <textarea
                          id={`note-${absence.id}`}
                          name="note"
                          rows={2}
                          required
                          minLength={3}
                          className="input resize-none bg-white"
                          placeholder="Explique ao servidor"
                        />
                        <button className="btn-danger btn-sm">Confirmar reprovação</button>
                      </form>
                    </details>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
