import type { Metadata } from "next";

import { markAllNoticesRead } from "@/app/app/avisos/actions";
import { formatDateBR, formatDateTimeBR } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";

export const metadata: Metadata = { title: "Avisos" };

export default async function EmployeeNoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const user = await requireEmployee();
  const { ok } = await searchParams;

  const notices = await prisma.notice.findMany({
    where: {
      companyId: user.companyId,
      OR: [{ targetUserId: user.id }, { targetUserId: null, type: "GENERAL" }],
    },
    include: { reads: { where: { userId: user.id } }, author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const unread = notices.filter((notice) => notice.reads.length === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Comunicação</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
            Avisos
          </h1>
          <p className="mt-2 helper">
            Comunicados do RH e avisos de demissão. {unread > 0 ? `${unread} não lido(s).` : "Tudo em dia."}
          </p>
        </div>

        {unread > 0 ? (
          <form action={markAllNoticesRead}>
            <button className="btn-secondary btn-sm">Marcar todos como lidos</button>
          </form>
        ) : null}
      </div>

      {ok ? <div className="alert-success">Todos os avisos foram marcados como lidos.</div> : null}

      {notices.length === 0 ? (
        <div className="card text-center">
          <p className="font-medium text-slate-700">Nenhum aviso por enquanto.</p>
          <p className="mt-1 text-sm text-slate-500">
            Quando o RH enviar um comunicado ou aviso de demissão, ele aparece aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => {
            const isTermination = notice.type === "TERMINATION";
            const isUnread = notice.reads.length === 0;

            return (
              <article
                key={notice.id}
                className={`rounded-2xl border p-5 ${
                  isTermination
                    ? "border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10"
                    : "border-[var(--border)] bg-[var(--surface)]"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {isTermination ? (
                    <span className="badge bg-rose-100 text-rose-800">Aviso de demissão</span>
                  ) : (
                    <span className="badge bg-[var(--surface-3)] text-[var(--muted)]">
                      Comunicado do RH
                    </span>
                  )}
                  {isUnread ? (
                    <span className="badge bg-amber-100 text-amber-800">Novo</span>
                  ) : null}
                  <span className="text-xs text-slate-500">
                    {formatDateTimeBR(notice.createdAt)}
                  </span>
                </div>

                <h2
                  className={`mt-2.5 text-lg font-semibold ${
                    isTermination ? "text-rose-900" : "text-slate-900"
                  }`}
                >
                  {notice.title}
                </h2>
                <p
                  className={`mt-1.5 whitespace-pre-line text-sm leading-relaxed ${
                    isTermination ? "text-rose-800" : "text-[var(--muted)]"
                  }`}
                >
                  {notice.message}
                </p>

                {notice.lastWorkingDay ? (
                  <p className="mt-3 rounded-lg border border-rose-200 bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-rose-900 dark:border-rose-500/30">
                    Último dia de trabalho: {formatDateBR(notice.lastWorkingDay)}
                  </p>
                ) : null}

                <p className="mt-3 text-xs text-slate-500">Enviado por {notice.author.name}</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
