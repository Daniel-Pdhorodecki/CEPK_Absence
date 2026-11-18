import { STATUS_STYLES, statusLabel } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`badge ${STATUS_STYLES[status] ?? "bg-[var(--surface-2)] text-[var(--muted)]"}`}
    >
      {statusLabel(status)}
    </span>
  );
}

export function KindBadge({ kind }: { kind: string }) {
  const medical = kind === "MEDICAL";
  return (
    <span
      className={`badge ${
        medical
          ? "border border-[var(--border-strong)] bg-transparent text-[var(--text)]"
          : "bg-[var(--surface-2)] text-[var(--muted)]"
      }`}
    >
      {medical ? "Médica" : "Comum"}
    </span>
  );
}
