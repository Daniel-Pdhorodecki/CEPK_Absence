import Link from "next/link";

/** Brasão do CEPK: escudo com a letra K, usado como marca do sistema. */
export function BrandMark({ className = "size-9" }: { className?: string }) {
  return (
    <span className={`brand-mark ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[62%] w-[62%]"
        aria-hidden="true"
      >
        <path d="M16 4.2 26 7.6v7.6c0 6-4.2 10.4-10 12.6-5.8-2.2-10-6.6-10-12.6V7.6L16 4.2Z" />
        <path d="M12.4 11.4v9.2M19.8 11.4 13.6 16l6.4 4.6" />
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
      className="inline-flex items-center gap-2.5"
      aria-label="CEPK Absence — início"
    >
      <BrandMark className="size-9" />
      {compact ? null : (
        <span className="flex flex-col leading-none">
          <span
            className={`text-[1.05rem] font-semibold tracking-tight ${
              light ? "text-white" : "brand-name"
            }`}
          >
            CEPK{" "}
            <span
              className={
                light ? "text-[#a3e635]" : "text-[var(--accent-lime)]"
              }
            >
              Absence
            </span>
          </span>
          <span
            className={`mt-1 text-[0.6rem] font-medium uppercase tracking-[0.18em] ${
              light ? "text-white/45" : "text-[var(--muted-2)]"
            }`}
          >
            Colégio Kennedy
          </span>
        </span>
      )}
    </Link>
  );
}
