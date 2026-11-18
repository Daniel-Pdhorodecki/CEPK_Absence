"use client";

import { Avatar } from "@/components/Avatar";
import type { ShellUser } from "@/components/Shell";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type NavItem = { href: string; label: string; icon: string };

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <path d="M3 10.5 12 3l9 7.5V21H3z" />,
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="M8 2v4M16 2v4M3 9h18" />
      </>
    ),
    list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
    check: <path d="m5 12.5 4.5 4.5L19 6.5" />,
    x: <path d="M6 6l12 12M18 6 6 18" />,
    bell: (
      <>
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </>
    ),
    building: (
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4.5 shrink-0"
      aria-hidden="true"
    >
      {paths[name] ?? paths.home}
    </svg>
  );
}

export function Sidebar({ items, user }: { items: NavItem[]; user: ShellUser }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status")?.toUpperCase() ?? null;

  const isActive = (href: string) => {
    const [targetPath, query] = href.split("?");
    const expectedStatus = query
      ? new URLSearchParams(query).get("status")?.toUpperCase()
      : null;

    const pathMatches =
      targetPath === "/app" || targetPath === "/rh"
        ? pathname === targetPath
        : pathname === targetPath || pathname.startsWith(`${targetPath}/`);

    if (!pathMatches) return false;
    if (expectedStatus) return currentStatus === expectedStatus;

    if (targetPath.endsWith("/faltas") || targetPath.endsWith("/solicitacoes")) {
      return !currentStatus || currentStatus === "ALL" || currentStatus === "PENDING";
    }

    return true;
  };

  return (
    <>
      <aside className="sidebar fixed inset-y-0 left-0 hidden w-64 flex-col px-4 py-6 lg:flex">
        <div className="flex items-center justify-between gap-2 px-2">
          <Logo light compact />
          <ThemeToggle />
        </div>

        <div className="sidebar-company mt-6 flex items-center gap-3">
          {user.hasLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/api/empresa/logo"
              alt={`Logo de ${user.companyName}`}
              className="size-9 shrink-0 rounded-xl bg-white/10 object-contain p-0.5"
            />
          ) : (
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-semibold text-white">
              {user.companyInitial}
            </span>
          )}
          <div className="min-w-0">
            <p className="sidebar-muted text-[10px] font-semibold uppercase tracking-[0.16em]">
              Empresa
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-white">
              {user.companyName}
            </p>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? "sidebar-link-active" : ""}`}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-4 border-t border-white/10 pt-4">
          <Link
            href={user.profileHref}
            className="group flex items-center gap-3 rounded-full px-1 py-1 transition hover:bg-white/5"
            title="Editar perfil e foto"
          >
            <Avatar
              userId={user.id}
              name={user.name}
              hasAvatar={user.hasAvatar}
              tone="dark"
              className="size-9"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="sidebar-muted text-xs">
                {user.role === "RH" ? "RH" : "Funcionário"} · ver perfil
              </p>
            </div>
          </Link>
          <form action="/api/logout" method="post" className="mt-3">
            <button className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white">
              Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)] backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <Logo compact />
          <div className="flex items-center gap-2">
            <Link
              href={user.profileHref}
              aria-label="Editar perfil e foto"
              className="rounded-full transition hover:opacity-80"
            >
              <Avatar
                userId={user.id}
                name={user.name}
                hasAvatar={user.hasAvatar}
                className="size-8"
              />
            </Link>
            <ThemeToggle />
            <form action="/api/logout" method="post">
              <button className="cursor-pointer text-sm font-medium text-[var(--muted)] transition hover:text-[var(--text)]">
                Sair
              </button>
            </form>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
                isActive(item.href)
                  ? "bg-[var(--btn-bg)] text-[var(--btn-fg)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
