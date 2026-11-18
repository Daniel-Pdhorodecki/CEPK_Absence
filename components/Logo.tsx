import Link from "next/link";

/**
 * Marca do CEPK Absence: calendário com selo de confirmação.
 * Em SVG para ficar nítida e acompanhar o tema claro/escuro.
 */
export function BrandMark({
  className = "size-10",
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "onDark";
}) {
  return (
    <span className={`inline-grid shrink-0 place-items-center ${className}`}>
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className={`h-full w-full ${
          tone === "onDark"
            ? "text-[#a3e635]"
            : "text-[#14532d] dark:text-[#a3e635]"
        }`}
        aria-hidden="true"
      >
        {/* Corpo do calendário */}
        <rect
          x="7.5"
          y="12.5"
          width="45"
          height="42"
          rx="8"
          stroke="currentColor"
          strokeWidth="5.5"
        />
        {/* Faixa superior preenchida */}
        <path
          d="M7.5 24.5V20.5a8 8 0 0 1 8-8h29a8 8 0 0 1 8 8v4H7.5Z"
          fill="currentColor"
        />
        {/* Argolas */}
        <path
          d="M20 7.5v9M40 7.5v9"
          stroke="currentColor"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        {/* Grade de dias */}
        <g fill="currentColor" opacity="0.32">
          <rect x="16.5" y="31.5" width="6.5" height="6.5" rx="1.6" />
          <rect x="27" y="31.5" width="6.5" height="6.5" rx="1.6" />
          <rect x="37.5" y="31.5" width="6.5" height="6.5" rx="1.6" />
          <rect x="16.5" y="42" width="6.5" height="6.5" rx="1.6" />
          <rect x="27" y="42" width="6.5" height="6.5" rx="1.6" />
        </g>
        {/* Selo de confirmação */}
        <circle cx="44.5" cy="45.5" r="12.5" fill="currentColor" />
        <circle cx="44.5" cy="45.5" r="12.5" stroke="var(--surface)" strokeWidth="3.5" />
        <path
          d="m38.5 45.7 4.2 4.2 7.6-8.2"
          stroke="var(--surface)"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  light = false,
  compact = false,
  href = "/",
}: {
  light?: boolean;
  compact?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3"
      aria-label="CEPK Absence — início"
    >
      <BrandMark className="size-10" tone={light ? "onDark" : "default"} />
      {compact ? null : (
        <>
          <span
            aria-hidden="true"
            className={`h-10 w-px ${
              light ? "bg-white/20" : "bg-[#a3e635]/40"
            }`}
          />
          <span className="flex flex-col leading-none">
            <span
              className={`text-[1.3rem] font-extrabold leading-none tracking-tight ${
                light ? "text-white" : "text-[var(--text)]"
              }`}
            >
              CEPK
            </span>
            <span
              className={`mt-1 text-[1.3rem] font-bold leading-none tracking-tight ${
                light ? "text-[#a3e635]" : "text-[#14532d] dark:text-[#a3e635]"
              }`}
            >
              Absence
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
