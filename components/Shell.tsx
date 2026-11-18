import { Sidebar } from "@/components/Sidebar";

export type ShellUser = {
  id: string;
  name: string;
  role: string;
  staffType: string;
  position: string | null;
  companyName: string;
  hasAvatar: boolean;
  profileHref: string;
};

export type ShellNavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: number;
};

export function Shell({
  user,
  items,
  children,
}: {
  user: ShellUser;
  items: ShellNavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="page-bg min-h-screen lg:flex">
      <Sidebar items={items} user={user} />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 lg:px-10 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
