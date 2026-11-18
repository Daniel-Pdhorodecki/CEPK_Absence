import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AbsenceCalendar } from "@/components/AbsenceCalendar";
import { createAbsenceRequest } from "@/app/app/solicitar/actions";
import { SHIFTS } from "@/lib/constants";
import {
  addDaysISO,
  dateToISO,
  formatDateBR,
  todayISO,
} from "@/lib/dates";
import { MEDICAL_PAST_DAYS, MIN_ADVANCE_DAYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requireEmployee } from "@/lib/session";

export const metadata: Metadata = { title: "Solicitar falta" };

export default async function RequestAbsencePage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const user = await requireEmployee();
  const { erro } = await searchParams;
  const today = todayISO();

  const termination = await prisma.notice.findFirst({
    where: { targetUserId: user.id, type: "TERMINATION" },
    orderBy: { lastWorkingDay: "desc" },
  });

  if (
    termination?.lastWorkingDay &&
    dateToISO(termination.lastWorkingDay) < today
  ) {
    redirect(
      `/app/solicitar?erro=${encodeURIComponent(
        "Seu contrato foi encerrado e não é possível solicitar novas faltas.",
      )}`,
    );
  }

  const earliestCommon = addDaysISO(today, MIN_ADVANCE_DAYS);
  const minCalendarDate = addDaysISO(today, -MEDICAL_PAST_DAYS);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Nova solicitação</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
          Solicitar falta
        </h1>
        <p className="mt-2 helper">
          Escolha o período, o turno e o motivo. Todo pedido, inclusive falta médica,
          passa pela análise do RH.
        </p>
      </div>

      {erro ? <div className="alert-error">{erro}</div> : null}

      {termination?.lastWorkingDay ? (
        <div className="alert-warning">
          Você tem um aviso de demissão com último dia em{" "}
          <strong>{formatDateBR(termination.lastWorkingDay)}</strong>. Só é possível pedir
          faltas até essa data.
        </div>
      ) : null}

      <form action={createAbsenceRequest} className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
        <section className="card">
          <h2 className="section-title">1. Período</h2>
          <p className="mt-1 helper">
            Toque no primeiro dia e depois no último dia. Para um único dia, toque duas
            vezes no mesmo dia.
          </p>
          <div className="mt-4">
            <AbsenceCalendar minISO={minCalendarDate} />
          </div>
        </section>

        <section className="card space-y-4">
          <h2 className="section-title">2. Detalhes</h2>

          <div>
            <label htmlFor="kind" className="label">
              Tipo de falta
            </label>
            <select id="kind" name="kind" className="input" defaultValue="COMMON">
              <option value="COMMON">Comum / folga (30 dias de antecedência)</option>
              <option value="MEDICAL">Médica (exige comprovante e análise do RH)</option>
            </select>
          </div>

          <div>
            <label htmlFor="shift" className="label">
              Turno
            </label>
            <select id="shift" name="shift" className="input" defaultValue="FULL_DAY" required>
              {SHIFTS.map((shift) => (
                <option key={shift.value} value={shift.value}>
                  {shift.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reason" className="label">
              Motivo
            </label>
            <textarea
              id="reason"
              name="reason"
              required
              minLength={5}
              rows={3}
              className="input resize-none"
              placeholder="Descreva o motivo da falta ou folga"
            />
          </div>

          <div>
            <label htmlFor="proof" className="label">
              Comprovante médico
            </label>
            <input
              id="proof"
              name="proof"
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              className="input file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[var(--btn-bg)] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[var(--btn-fg)]"
            />
            <p className="mt-1.5 text-xs text-[var(--muted)]">
              Obrigatório para falta médica. JPG, PNG ou PDF até 5 MB.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-xs leading-relaxed text-[var(--muted)]">
            <p>
              <strong>Comum:</strong> só pode ser solicitada a partir de{" "}
              {formatDateBR(earliestCommon)} (30 dias).
            </p>
            <p className="mt-1">
              <strong>Médica:</strong> pode ser registrada para os últimos{" "}
              {MEDICAL_PAST_DAYS} dias ou datas futuras de consulta, com comprovante.
              O pedido fica pendente até a análise do RH.
            </p>
          </div>

          <button type="submit" className="btn-primary w-full">
            Enviar solicitação
          </button>
        </section>
      </form>
    </div>
  );
}
