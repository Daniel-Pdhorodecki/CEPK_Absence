import { randomInt } from "node:crypto";

export const MIN_ADVANCE_DAYS = 30;
export const MIN_TERMINATION_DAYS = 15;
export const MAX_ABSENCE_DAYS = 90;
export const MEDICAL_PAST_DAYS = 30;
export const MEDICAL_FUTURE_DAYS = 365;

export const MAX_PROOF_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_PROOF_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

export const SHIFTS = [
  { value: "MORNING", label: "Manhã" },
  { value: "AFTERNOON", label: "Tarde" },
  { value: "NIGHT", label: "Noite" },
  { value: "FULL_DAY", label: "Integral" },
] as const;

export const SHIFT_LABELS: Record<string, string> = Object.fromEntries(
  SHIFTS.map((shift) => [shift.value, shift.label]),
);

export const KIND_LABELS: Record<string, string> = {
  COMMON: "Falta comum",
  MEDICAL: "Falta médica",
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovada",
  REJECTED: "Reprovada",
};

export const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
};

export const ROLE_LABELS: Record<string, string> = {
  RH: "RH",
  EMPLOYEE: "Funcionário",
};

// Sem caracteres ambíguos (0/O, 1/I).
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCompanyCode(prefix = ""): string {
  let code = prefix;
  while (code.length < 8) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

export function isShift(value: string): boolean {
  return SHIFTS.some((shift) => shift.value === value);
}

/** Decide o label de um status com fallback. */
export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
