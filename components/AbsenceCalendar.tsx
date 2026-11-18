"use client";

import { useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { differenceInCalendarDays, format } from "date-fns";
import "react-day-picker/style.css";

export function AbsenceCalendar({ minISO }: { minISO?: string }) {
  const [range, setRange] = useState<DateRange | undefined>();

  const from = range?.from;
  const to = range?.to ?? range?.from;
  const start = from ? format(from, "yyyy-MM-dd") : "";
  const end = from ? format(to ?? from, "yyyy-MM-dd") : "";
  const days = from && to ? differenceInCalendarDays(to, from) + 1 : 0;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:p-5">
      <input type="hidden" name="startDate" value={start} />
      <input type="hidden" name="endDate" value={end} />

      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
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
            <rect x="3" y="4" width="18" height="17" rx="3" />
            <path d="M8 2v4M16 2v4M3 9h18" />
          </svg>
          Escolha no calendário
        </div>
        {days > 0 ? (
          <span className="badge bg-[var(--btn-bg)] text-[var(--btn-fg)]">
            {days} {days === 1 ? "dia" : "dias"}
          </span>
        ) : null}
      </div>

      <div className="wa-calendar flex justify-center">
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          locale={ptBR}
          numberOfMonths={1}
          disabled={minISO ? { before: new Date(`${minISO}T12:00:00`) } : undefined}
          showOutsideDays
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { label: "Início", value: from ? format(from, "dd/MM/yyyy") : "—" },
          { label: "Fim", value: from ? format(to ?? from, "dd/MM/yyyy") : "—" },
          {
            label: "Duração",
            value: days > 0 ? `${days} ${days === 1 ? "dia" : "dias"}` : "—",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              {item.label}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-[var(--text)]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs leading-relaxed text-[var(--muted)]">
          {from
            ? "Toque em outro dia para ajustar o fim do período."
            : "Toque no primeiro dia e depois no último dia do período."}
        </p>
        {from ? (
          <button
            type="button"
            onClick={() => setRange(undefined)}
            className="shrink-0 cursor-pointer text-xs font-semibold text-[var(--text)] underline underline-offset-4"
          >
            Limpar seleção
          </button>
        ) : null}
      </div>
    </div>
  );
}
