"use client";

import { useState } from "react";

import { registerAction } from "@/app/actions/auth";

export function RegisterForm() {
  const [staffType, setStaffType] = useState<"PROFESSOR" | "FUNCIONARIO">(
    "PROFESSOR",
  );

  return (
    <form action={registerAction} className="space-y-4">
      <fieldset>
        <legend className="label">Como você atua na escola?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              value: "PROFESSOR" as const,
              title: "Professor(a)",
              description: "Docente da instituição.",
              icon: (
                <>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                </>
              ),
            },
            {
              value: "FUNCIONARIO" as const,
              title: "Funcionário(a)",
              description: "Monitor, limpeza, manutenção e outros.",
              icon: (
                <>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </>
              ),
            },
          ].map((option) => {
            const active = staffType === option.value;
            return (
              <label
                key={option.value}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  active
                    ? "border-[var(--accent-lime)] bg-[var(--surface-2)]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]"
                }`}
              >
                <input
                  type="radio"
                  name="staffType"
                  value={option.value}
                  checked={active}
                  onChange={() => setStaffType(option.value)}
                  className="sr-only"
                />
                <span className="flex items-center gap-2 text-[var(--text)]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                    aria-hidden="true"
                  >
                    {option.icon}
                  </svg>
                  <span className="text-sm font-semibold">{option.title}</span>
                </span>
                <span className="mt-1.5 block text-xs leading-relaxed text-[var(--muted)]">
                  {option.description}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {staffType === "FUNCIONARIO" ? (
        <div>
          <label htmlFor="position" className="label">
            Seu cargo
          </label>
          <input
            id="position"
            name="position"
            required
            className="input"
            placeholder="Ex.: monitor, limpeza, manutenção"
            maxLength={60}
          />
        </div>
      ) : (
        <input type="hidden" name="position" value="" />
      )}

      <div>
        <label htmlFor="name" className="label">
          Nome completo
        </label>
        <input id="name" name="name" required className="input" placeholder="Seu nome" />
      </div>

      <div>
        <label htmlFor="email" className="label">
          E-mail institucional
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input"
          placeholder="voce@escola.pr.gov.br"
          pattern="^[^@\s]+@escola\.pr\.gov\.br$"
          title="Use um e-mail terminado em @escola.pr.gov.br"
        />
        <p className="mt-1.5 text-xs text-[var(--muted)]">
          Somente e-mails terminados em <strong>@escola.pr.gov.br</strong>.
        </p>
      </div>

      <div>
        <label htmlFor="password" className="label">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
          className="input"
          placeholder="Mínimo de 6 caracteres"
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        Enviar cadastro para aprovação
      </button>
    </form>
  );
}
