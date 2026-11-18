function initialsOf(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean);

  const chosen = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;

  return chosen
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  userId,
  name,
  hasAvatar,
  className = "size-9",
  textClassName = "text-xs",
  tone = "light",
}: {
  userId: string;
  name: string;
  hasAvatar: boolean;
  className?: string;
  textClassName?: string;
  tone?: "light" | "dark";
}) {
  if (hasAvatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/avatar/${userId}`}
        alt={`Foto de ${name}`}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  const colors =
    tone === "dark"
      ? "bg-white/10 text-white"
      : "border border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--muted)]";

  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${colors} ${textClassName} ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
