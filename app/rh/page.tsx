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
import { requireRH } from "@/lib/session";

export const metadata: Metadata = { title: "Visão geral" };

export default async function RhHomePage({
  searchParams,
}: {
  searchParams: Promise<{ bemvindo?: string }>;
}) {
  const user = await requireRH();
  const { bemvindo } = await searchParams;
  const today = todayISO();

  const [pending, approved, rejected, employees, latest, notices] = await Promise.all([
    prisma.absenceRequest.count({ where: { companyId: user.companyId, status: "PENDING" } }),
    prisma.absenceRequest.count({ where: { companyId: user.companyId, status: "APPROVED" } }),
    prisma.absenceRequest.count({ where: { companyId: user.companyId, status: "REJECTED" } }),
    prisma.user.count({ where: { companyId: user.companyId, role: "EMPLOYEE" } }),
    prisma.absenceRequest.findMany({
      where: { companyId: user.companyId },
      include: { user: { select: { id: true, name: true, hasAvatar: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.notice.findMany({
      where: { companyId: user.companyId },
      include: { _count: { select: { reads: true } }, target: { select: { name: true } } },
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
          <p className="eyebrow">Painel do RH</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
            Olá, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-2 helper">
            {user.company.name} · {formatDateBR(today)}
          </p>
        </div>
        <Link href="/rh/solicitacoes" className="btn-primary btn-sm">
          Ver solicitações
        </Link>
      </div>

      {bemvindo ? (
        <div className="alert-success">
          <p className="font-semibold">Empresa criada com sucesso!</p>
          <p className="mt-1">
            Compartilhe o código de funcionário com a equipe. Você é o responsável pelo
            RH desta empresa.
          </p>
          <Link href="/rh/empresa" className="mt-2 inline-flex font-semibold underline">
            Ver códigos da empresa →
          </Link>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/rh/solicitacoes?status=PENDING"
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
          href="/rh/solicitacoes?status=APPROVED"
          className="card-tight transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Aprovadas
            </p>
            <span className="text-[var(--muted-2)]">→</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">{approved}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">Histórico da empresa</p>
        </Link>
        <Link
          href="/rh/solicitacoes?status=REJECTED"
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
          href="/rh/funcionarios"
          className="card-tight transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
              Funcionários
            </p>
            <span className="text-[var(--muted-2)]">→</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-[var(--text)]">{employees}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{terminations} em aviso de demissão</p>
        </Link>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-title">Últimas solicitações</h2>
            <Link href="/rh/solicitacoes" className="link text-sm">
              Ver todas
            </Link>
          </div>

          <div className="mt-4 divide-y divide-[var(--border)]">
            {latest.length === 0 ? (
              <p className="py-4 text-sm text-slate-500">Nenhuma solicitação recebida ainda.</p>
            ) : (
              latest.map((absence) => (
                <div key={absence.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      userId={absence.user.id}
                      name={absence.user.name}
                      hasAvatar={absence.user.hasAvatar}
                      className="size-9"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{absence.user.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatRangeBR(dateToISO(absence.startDate), dateToISO(absence.endDate))} ·{" "}
                        {SHIFT_LABELS[absence.shift] ?? absence.shift}
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
            <Link href="/rh/avisos" className="link text-sm">
              Gerenciar
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {notices.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Nenhum aviso publicado.
              </p>
            ) : (
              notices.map((notice) => (
                <div key={notice.id} className="rounded-xl border border-slate-200 p-3.5">
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
                      {notice._count.reads} leitura(s)
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-800">{notice.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {notice.type === "TERMINATION"
                      ? `Para ${notice.target?.name ?? "funcionário"}`
                      : "Para todos os funcionários"}{" "}
                    · {formatDateTimeBR(notice.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="panel-inverse mt-5 p-4">
            <p className="text-sm font-semibold">Código da empresa</p>
            <p className="mt-1 text-xs text-slate-300">
              Compartilhe com os funcionários para eles se cadastrarem.
            </p>
            <div className="mt-2 rounded-xl bg-white/10 px-3 py-2 text-center font-mono text-lg font-semibold tracking-[0.2em]">
              {user.company.employeeCode}
            </div>
            <Link href="/rh/empresa" className="btn-inverse mt-3 w-full">
              Ver todos os códigos
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
