import type { Metadata } from "next";

import { Avatar } from "@/components/Avatar";
import { userPositionLabel } from "@/lib/constants";
import { dateToISO, formatDateBR } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Equipe" };

export default async function EmployeesPage() {
  const rh = await requireAdmin();

  const [employees, terminationNotices] = await Promise.all([
    prisma.user.findMany({
      where: { companyId: rh.companyId, role: "EMPLOYEE" },
      include: {
        _count: { select: { absences: true } },
        absences: {
          where: { status: "PENDING" },
          select: { id: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.notice.findMany({
      where: { companyId: rh.companyId, type: "TERMINATION" },
      include: { target: { select: { name: true } } },
      orderBy: { lastWorkingDay: "desc" },
    }),
  ]);

  const terminationByUser = new Map<string, Date>();
  for (const notice of terminationNotices) {
    if (notice.targetUserId && notice.lastWorkingDay) {
      const current = terminationByUser.get(notice.targetUserId);
      if (!current || notice.lastWorkingDay > current) {
        terminationByUser.set(notice.targetUserId, notice.lastWorkingDay);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Equipe</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
          Equipe
        </h1>
        <p className="mt-2 helper">
          {employees.length} pessoa(s) aprovada(s) em {rh.company.name}.
        </p>
      </div>

      {employees.length === 0 ? (
        <div className="card text-center">
          <p className="font-medium text-[var(--text)]">Nenhuma pessoa aprovada ainda.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Os novos cadastros precisam ser aprovados na aba Cadastros.
          </p>
          <a href="/admin/cadastros" className="btn-primary mt-4">
            Analisar cadastros
          </a>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="hidden grid-cols-[1.4fr_1fr_0.7fr_0.9fr] gap-4 border-b border-[var(--border)] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-2)] md:grid">
            <span>Servidor</span>
            <span>Cadastro</span>
            <span>Pedidos</span>
            <span>Pendentes</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {employees.map((employee) => {
              const lastDay = terminationByUser.get(employee.id);
              return (
                <div
                  key={employee.id}
                  className="grid gap-2 px-6 py-4 md:grid-cols-[1.4fr_1fr_0.7fr_0.9fr] md:items-center md:gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      userId={employee.id}
                      name={employee.name}
                      hasAvatar={employee.hasAvatar}
                      className="size-9"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{employee.name}</p>
                        {lastDay ? (
                          <span className="badge bg-rose-100 text-rose-800">
                            Aviso até {formatDateBR(lastDay)}
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-[var(--muted)]">
                        {employee.email} · {userPositionLabel(employee)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    {formatDateBR(dateToISO(employee.createdAt))}
                  </p>
                  <p className="text-sm text-slate-600">{employee._count.absences}</p>
                  <div>
                    {employee.absences.length > 0 ? (
                      <span className="badge bg-amber-100 text-amber-800">
                        {employee.absences.length} pendente(s)
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {terminationNotices.length > 0 ? (
        <section className="card">
          <h2 className="section-title">Avisos de demissão ativos</h2>
          <div className="mt-3 space-y-2">
            {terminationNotices
              .filter((notice) => notice.lastWorkingDay && notice.targetUserId)
              .map((notice) => (
                <div
                  key={notice.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/30 dark:bg-rose-500/10"
                >
                  <div>
                    <p className="text-sm font-semibold text-rose-900">{notice.title}</p>
                    <p className="text-xs text-rose-700">
                      Último dia: {formatDateBR(notice.lastWorkingDay!)}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-rose-700">
                    {notice.target?.name ?? "Servidor"}
                  </span>
                </div>
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
