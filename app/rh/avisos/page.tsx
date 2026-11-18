import type { Metadata } from "next";

import { createNoticeAction } from "@/app/rh/avisos/actions";
import { formatDateBR, formatDateTimeBR, todayISO } from "@/lib/dates";
import { MIN_TERMINATION_DAYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireRH } from "@/lib/session";

export const metadata: Metadata = { title: "Avisos" };

export default async function RhNoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const rh = await requireRH();
  const { ok, erro } = await searchParams;

  const [notices, employees] = await Promise.all([
    prisma.notice.findMany({
      where: { companyId: rh.companyId },
      include: {
        author: { select: { name: true } },
        target: { select: { name: true } },
        _count: { select: { reads: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { companyId: rh.companyId, role: "EMPLOYEE" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Comunicação</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
          Avisos
        </h1>
        <p className="mt-2 helper">
          Publique comunicados para toda a equipe ou envie avisos de demissão individuais.
        </p>
      </div>

      {ok ? <div className="alert-success">{ok}</div> : null}
      {erro ? <div className="alert-error">{erro}</div> : null}

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="card">
          <h2 className="section-title">Novo aviso</h2>

          <form action={createNoticeAction} className="mt-4 space-y-4">
            <div>
              <label htmlFor="type" className="label">
                Tipo
              </label>
              <select id="type" name="type" className="input" defaultValue="GENERAL">
                <option value="GENERAL">Comunicado para todos</option>
                <option value="TERMINATION">Aviso de demissão (individual)</option>
              </select>
            </div>

            <div>
              <label htmlFor="targetUserId" className="label">
                Funcionário (somente demissão)
              </label>
              <select id="targetUserId" name="targetUserId" className="input" defaultValue="">
                <option value="">Todos / não se aplica</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} · {employee.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="lastWorkingDay" className="label">
                Último dia de trabalho
              </label>
              <input
                id="lastWorkingDay"
                name="lastWorkingDay"
                type="date"
                min={todayISO()}
                className="input"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Obrigatório para demissão, com no mínimo {MIN_TERMINATION_DAYS} dias de
                antecedência.
              </p>
            </div>

            <div>
              <label htmlFor="title" className="label">
                Título
              </label>
              <input
                id="title"
                name="title"
                required
                minLength={3}
                className="input"
                placeholder="Ex.: Reunião geral na sexta"
              />
            </div>

            <div>
              <label htmlFor="message" className="label">
                Mensagem
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                minLength={5}
                className="input resize-none"
                placeholder="Escreva o comunicado para os funcionários"
              />
            </div>

            <button className="btn-primary w-full">Publicar aviso</button>
          </form>
        </section>

        <section className="space-y-3">
          <h2 className="section-title">Publicados ({notices.length})</h2>

          {notices.length === 0 ? (
            <div className="card text-center">
              <p className="text-sm font-medium text-slate-700">Nenhum aviso publicado.</p>
              <p className="mt-1 text-xs text-slate-500">
                Os avisos aparecem no menu do funcionário imediatamente.
              </p>
            </div>
          ) : (
            notices.map((notice) => (
              <article
                key={notice.id}
                className={`rounded-2xl border p-4 ${
                  notice.type === "TERMINATION"
                    ? "border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`badge ${
                      notice.type === "TERMINATION"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-[var(--surface-3)] text-[var(--muted)]"
                    }`}
                  >
                    {notice.type === "TERMINATION" ? "Demissão" : "Comunicado"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatDateTimeBR(notice.createdAt)}
                  </span>
                  <span className="badge border border-[var(--border)] text-[var(--muted)]">
                    {notice._count.reads} leitura(s)
                  </span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-slate-900">{notice.title}</h3>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {notice.message}
                </p>
                {notice.type === "TERMINATION" ? (
                  <p className="mt-2 text-xs font-semibold text-rose-800">
                    Para {notice.target?.name ?? "funcionário"} · último dia{" "}
                    {notice.lastWorkingDay ? formatDateBR(notice.lastWorkingDay) : "—"}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">Para todos os funcionários</p>
                )}
                <p className="mt-1 text-xs text-slate-400">Por {notice.author.name}</p>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
