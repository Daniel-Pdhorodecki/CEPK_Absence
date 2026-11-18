import Link from "next/link";
import type { Metadata } from "next";

import { KindBadge, StatusBadge } from "@/components/Badges";
import { Avatar } from "@/components/Avatar";
import { SHIFT_LABELS } from "@/lib/constants";
import {
  dateToISO,
  formatDateBR,
  formatDateTimeBR,
  formatRangeBR,
  todayISO,
} from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Visão geral" };

export default async function AdminHomePage() {
  const user = await requireAdmin();
  const today = todayISO();

  const [pending, approved, rejected, people, pendingRegistrations, latest, notices] =
    await Promise.all([
      prisma.absenceRequest.count({
        where: { companyId: user.companyId, status: "PENDING" },
      }),
      prisma.absenceRequest.count({
        where: { companyId: user.companyId, status: "APPROVED" },
      }),
      prisma.absenceRequest.count({
        where: { companyId: user.companyId, status: "REJECTED" },
      }),
      prisma.user.count({
        where: {
          companyId: user.companyId,
          role: "EMPLOYEE",
          status: "APPROVED",
        },
      }),
      prisma.user.count({
        where: { companyId: user.companyId, status: "PENDING" },
      }),
      prisma.absenceRequest.findMany({
        where: { companyId: user.companyId },
        include: { user: { select: { id: true, name: true, hasAvatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.notice.findMany({
        where: { companyId: user.companyId },
        include: {
          _count: { select: { reads: true } },
          target: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

  const terminations = await prisma.notice.count({
    where: {
      companyId: user.companyId,
      type: "TERMINATION",
      lastWorkingDay: { gte: new Date(`${today}T00:00:00.000Z`) },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Painel da administração</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
            Olá, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-2 helper">
            {user.company.name} · {formatDateBR(today)}
          </p>
        </div>
        <Link href="/admin/solicitacoes" className="btn-primary btn-sm">
          Ver solicitações
        </Link>
      </div>

      {pendingRegistrations > 0 ? (
        <div className="alert-success flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">
              {pendingRegistrations} cadastro(s) aguardando aprovação
            </p>
            <p className="mt-1 text-sm">
              Analise os novos professores e funcionários para liberar o acesso.
            </p>
          </div>
          <Link href="/admin/cadastros" className="btn-primary btn-sm">
            Analisar cadastros
          </Link>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/solicitacoes?status=PENDING"
          className="card-tight transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Pendentes
            </p>
            <span className="text-[var(--muted-2)]">→</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-amber-600">{pending}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Aguardando sua análise</p>
        </Link>
        <Link
          href="/admin/solicitacoes?status=APPROVED"
          className="card-tight transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Aprovadas
            </p>
            <span className="text-[var(--muted-2)]">→</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">{approved}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Histórico da instituição</p>
        </Link>
        <Link
          href="/admin/solicitacoes?status=REJECTED"
          className="card-tight transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Reprovadas
            </p>
            <span className="text-[var(--muted-2)]">→</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-rose-600">{rejected}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Pedidos recusados</p>
        </Link>
        <Link
          href="/admin/funcionarios"
          className="card-tight transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Equipe
            </p>
            <span className="text-[var(--muted-2)]">→</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-[var(--text)]">{people}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {terminations} em aviso de desligamento
          </p>
        </Link>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-title">Últimas solicitações</h2>
            <Link href="/admin/solicitacoes" className="link text-sm">
              Ver todas
            </Link>
          </div>

          <div className="mt-4 divide-y divide-[var(--border)]">
            {latest.length === 0 ? (
              <p className="py-4 text-sm text-[var(--muted)]">
                Nenhuma solicitação recebida ainda.
              </p>
            ) : (
              latest.map((absence) => (
                <div
                  key={absence.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      userId={absence.user.id}
                      name={absence.user.name}
                      hasAvatar={absence.user.hasAvatar}
                      className="size-9"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text)]">
                        {absence.user.name}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {formatRangeBR(
                          dateToISO(absence.startDate),
                          dateToISO(absence.endDate),
                        )}{" "}
                        · {SHIFT_LABELS[absence.shift] ?? absence.shift}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <KindBadge kind={absence.kind} />
                    <StatusBadge status={absence.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-title">Avisos recentes</h2>
            <Link href="/admin/avisos" className="link text-sm">
              Gerenciar
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {notices.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--border-strong)] p-4 text-sm text-[var(--muted)]">
                Nenhum aviso publicado.
              </p>
            ) : (
              notices.map((notice) => (
                <div
                  key={notice.id}
                  className="rounded-xl border border-[var(--border)] p-3.5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`badge ${
                        notice.type === "TERMINATION"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-[var(--surface-3)] text-[var(--muted)]"
                      }`}
                    >
                      {notice.type === "TERMINATION" ? "Desligamento" : "Comunicado"}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {notice._count.reads} leitura(s)
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[var(--text)]">
                    {notice.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {notice.type === "TERMINATION"
                      ? `Para ${notice.target?.name ?? "servidor"}`
                      : "Para todos os servidores"}{" "}
                    · {formatDateTimeBR(notice.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="panel-inverse mt-5 p-4">
            <p className="text-sm font-semibold">Cadastros pendentes</p>
            <p className="mt-1 text-xs text-slate-300">
              Aprove novos professores e funcionários para liberar o acesso ao sistema.
            </p>
            <div className="mt-2 rounded-xl bg-white/10 px-3 py-2 text-center font-mono text-lg font-semibold tracking-[0.2em]">
              {pendingRegistrations}
            </div>
            <Link href="/admin/cadastros" className="btn-inverse mt-3 w-full">
              Analisar cadastros
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
