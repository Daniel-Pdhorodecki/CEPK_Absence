import {
  addDaysISO,
  diffDays,
  isoToDate,
  todayISO,
} from "@/lib/dates";
import {
  ALLOWED_PROOF_TYPES,
  MAX_ABSENCE_DAYS,
  MAX_PROOF_BYTES,
  MEDICAL_FUTURE_DAYS,
  MEDICAL_PAST_DAYS,
  MIN_ADVANCE_DAYS,
  MIN_TERMINATION_DAYS,
  isShift,
} from "@/lib/constants";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type ProofInfo = { size: number; type: string } | null;

export type AbsenceInput = {
  kind: string;
  shift: string;
  startISO: string;
  endISO: string;
  reason: string;
  proof: ProofInfo;
  terminationLastDayISO?: string | null;
};

export function isValidISODate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const date = isoToDate(value);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * Valida uma solicitação de falta e devolve a primeira mensagem de erro,
 * ou null quando está tudo certo. As mesmas regras valem para a tela e para o servidor.
 */
export function validateAbsenceInput(input: AbsenceInput): string | null {
  const today = todayISO();

  if (!isValidISODate(input.startISO) || !isValidISODate(input.endISO)) {
    return "Selecione datas válidas no calendário.";
  }
  if (diffDays(input.startISO, input.endISO) < 0) {
    return "A data final não pode ser anterior à data inicial.";
  }
  if (diffDays(input.startISO, input.endISO) + 1 > MAX_ABSENCE_DAYS) {
    return `O pedido pode ter no máximo ${MAX_ABSENCE_DAYS} dias.`;
  }
  if (!isShift(input.shift)) {
    return "Selecione um turno válido.";
  }

  const reason = input.reason.trim();
  if (reason.length < 5) {
    return "Descreva o motivo com pelo menos 5 caracteres.";
  }

  if (input.terminationLastDayISO) {
    if (diffDays(today, input.terminationLastDayISO) < 0) {
      return "Seu contrato já foi encerrado e não é possível solicitar novas faltas.";
    }
    if (diffDays(input.terminationLastDayISO, input.startISO) > 0) {
      return "A falta não pode acontecer depois do seu último dia de trabalho.";
    }
  }

  if (input.kind === "COMMON") {
    const advance = diffDays(today, input.startISO);
    if (advance < MIN_ADVANCE_DAYS) {
      return `Faltas comuns precisam de ${MIN_ADVANCE_DAYS} dias de antecedência. Faltam ${Math.max(advance, 0)} dia(s).`;
    }
  } else if (input.kind === "MEDICAL") {
    if (!input.proof) {
      return "A falta médica precisa de um comprovante (JPG, PNG ou PDF).";
    }
    if (input.proof.size <= 0) {
      return "O comprovante enviado está vazio.";
    }
    if (input.proof.size > MAX_PROOF_BYTES) {
      return "O comprovante deve ter no máximo 5 MB.";
    }
    if (!ALLOWED_PROOF_TYPES.includes(input.proof.type as (typeof ALLOWED_PROOF_TYPES)[number])) {
      return "Formato inválido. Envie JPG, PNG ou PDF.";
    }
    if (diffDays(today, input.startISO) > MEDICAL_FUTURE_DAYS) {
      return `Faltas médicas podem ser registradas com no máximo ${MEDICAL_FUTURE_DAYS} dias de antecedência.`;
    }
    if (diffDays(input.startISO, today) > MEDICAL_PAST_DAYS) {
      return `Não é possível registrar falta médica com mais de ${MEDICAL_PAST_DAYS} dias de atraso.`;
    }
  } else {
    return "Tipo de falta inválido.";
  }

  return null;
}

export function validateTermination(lastWorkingDayISO: string): string | null {
  const today = todayISO();
  if (!isValidISODate(lastWorkingDayISO)) {
    return "Informe uma data válida para o último dia de trabalho.";
  }
  if (diffDays(today, lastWorkingDayISO) < 0) {
    return "O último dia de trabalho não pode estar no passado.";
  }
  if (diffDays(today, lastWorkingDayISO) < MIN_TERMINATION_DAYS) {
    return `O aviso de demissão precisa de ${MIN_TERMINATION_DAYS} dias de antecedência em relação ao último dia.`;
  }
  return null;
}

export function earliestCommonDateISO(): string {
  return addDaysISO(todayISO(), MIN_ADVANCE_DAYS);
}
