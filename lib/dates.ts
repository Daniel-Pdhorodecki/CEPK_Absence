const TIME_ZONE = "America/Sao_Paulo";
const DAY_MS = 24 * 60 * 60 * 1000;

/** Data de hoje (fuso de São Paulo) no formato YYYY-MM-DD. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Converte YYYY-MM-DD em Date na meia-noite UTC (forma como salvamos no banco). */
export function isoToDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Converte Date do banco em YYYY-MM-DD. */
export function dateToISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  return dateToISO(new Date(isoToDate(iso).getTime() + days * DAY_MS));
}

/** Diferença em dias: target - base (positivo = target no futuro). */
export function diffDays(baseISO: string, targetISO: string): number {
  return Math.round((isoToDate(targetISO).getTime() - isoToDate(baseISO).getTime()) / DAY_MS);
}

export function formatDateBR(iso: string | Date): string {
  const value = typeof iso === "string" ? iso : dateToISO(iso);
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export function formatDateTimeBR(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRangeBR(startISO: string, endISO: string): string {
  if (startISO === endISO) return formatDateBR(startISO);
  return `${formatDateBR(startISO)} a ${formatDateBR(endISO)}`;
}

export function daysInclusive(startISO: string, endISO: string): number {
  return diffDays(startISO, endISO) + 1;
}

export function weekdayBR(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", timeZone: "UTC" }).format(
    isoToDate(iso),
  );
}

/** Data/hora atual no fuso do Brasil, útil para texto de avisos. */
export function nowBR(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());
}
