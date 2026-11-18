import { Shell } from "@/components/Shell";
import { requireEmployee } from "@/lib/session";

const items = [
  { href: "/app", label: "Início", icon: "home" },
  { href: "/app/solicitar", label: "Solicitar falta", icon: "calendar" },
  { href: "/app/faltas", label: "Minhas faltas", icon: "list" },
  { href: "/app/faltas?status=APPROVED", label: "Aprovadas", icon: "check" },
  { href: "/app/faltas?status=REJECTED", label: "Reprovadas", icon: "x" },
  { href: "/app/avisos", label: "Avisos", icon: "bell" },
];

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireEmployee();

  return (
    <Shell
      items={items}
      user={{
        id: user.id,
        name: user.name,
        role: user.role,
        companyName: user.company.name,
        companyInitial: user.company.name.trim().charAt(0).toUpperCase() || "?",
        hasAvatar: user.hasAvatar,
        hasLogo: user.company.hasLogo,
        profileHref: "/app/perfil",
      }}
    >
      {children}
    </Shell>
  );
}
