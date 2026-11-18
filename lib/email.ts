import { EMAIL_DOMAIN } from "@/lib/constants";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Só aceita e-mails institucionais terminados em @escola.pr.gov.br. */
export function isInstitutionalEmail(email: string): boolean {
  return (
    EMAIL_REGEX.test(email) &&
    email.trim().toLowerCase().endsWith(`@${EMAIL_DOMAIN}`)
  );
}

export function institutionalEmailError(): string {
  return `Use seu e-mail institucional terminado em @${EMAIL_DOMAIN}.`;
}
