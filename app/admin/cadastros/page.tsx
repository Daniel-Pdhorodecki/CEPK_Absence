import type { Metadata } from "next";

import {
  approveRegistrationAction,
  rejectRegistrationAction,
} from "@/app/admin/cadastros/actions";
import { STAFF_TYPE_LABELS, userPositionLabel } from "@/lib/constants";
import { formatDateTimeBR } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Cadastros" };

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const admin = await requireAdmin();
  const { ok, erro } = await searchParams;

  const [pending, reviewed] = await Promise.all([
    prisma.user.findMany({
      where: { companyId: admin.companyId, role: "EMPLOYEE", status: "PENDING" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findMany({
      where: {
        companyId: admin.companyId,
        role: "EMPLOYEE",
        status: { in: ["APPROVED", "REJECTED"] },
      },
      include: { approvedBy: { select: { name: true } } },
      orderBy: { approvedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Aprovações</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
          Cadastros
        </h1>
        <p className="mt-2 helper">
          Aprove ou reprove os novos professores e funcionários da instituição.
        </p>
      </div>

      {ok ? <div className="alert-success">{ok}</div> : null}
      {erro ? <div className="alert-error">{erro}</div> : null}

      <section className="space-y-3">
        <h2 className="section-title">
          Aguardando aprovação ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <div className="card text-center">
            <p className="font-medium text-[var(--text)]">Nenhum cadastro pendente.</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Novos cadastros aparecem aqui para análise.
            </p>
          </div>
        ) : (
          pending.map((person) => (
            <article key={person.id} className="card-tight">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-[var(--text)]">
                    {person.name}
                  </h3>
                  <p className="truncate text-sm text-[var(--muted)]">{person.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="badge bg-[var(--surface-3)] text-[var(--muted)]">
                      {STAFF_TYPE_LABELS[person.staffType] ?? person.staffType}
                    </span>
                    <span className="badge border border-[var(--border-strong)] text-[var(--muted)]">
                      {userPositionLabel(person)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Enviado em {formatDateTimeBR(person.createdAt)}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-start gap-3 border-t border-[var(--border)] pt-3">
                <form action={approveRegistrationAction}>
                  <input type="hidden" name="id" value={person.id} />
                  <button className="btn-primary btn-sm">Aprovar</button>
                </form>

                <details className="grow">
                  <summary className="btn-secondary btn-sm inline-flex cursor-pointer list-none">
                    Reprovar
                  </summary>
                  <form
                    action={rejectRegistrationAction}
                    className="mt-3 space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-500/30 dark:bg-rose-500/10"
                  >
                    <input type="hidden" name="id" value={person.id} />
                    <label
                      htmlFor={`note-${person.id}`}
                      className="text-xs font-semibold text-rose-800 dark:text-rose-300"
                    >
                      Motivo da reprovação
                    </label>
                    <textarea
                      id={`note-${person.id}`}
                      name="note"
                      rows={2}
                      required
                      minLength={3}
                      className="input resize-none bg-white"
                      placeholder="Explique ao solicitante"
                    />
                    <button className="btn-danger btn-sm">
                      Confirmar reprovação
                    </button>
                  </form>
                </details>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Análises recentes</h2>

        {reviewed.length === 0 ? (
          <div className="card text-center">
            <p className="text-sm text-[var(--muted)]">
              Nenhum cadastro analisado ainda.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="divide-y divide-[var(--border)]">
              {reviewed.map((person) => (
                <div
                  key={person.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text)]">
                      {person.name}
                    </p>
                    <p className="truncate text-xs text-[var(--muted)]">
                      {person.email} · {userPositionLabel(person)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`badge ${
                        person.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {person.status === "APPROVED" ? "Aprovado" : "Reprovado"}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {person.approvedBy?.name ?? "Administração"}
                      {person.approvedAt
                        ? ` · ${formatDateTimeBR(person.approvedAt)}`
                        : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
