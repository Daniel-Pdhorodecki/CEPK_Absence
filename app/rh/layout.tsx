import { Shell } from "@/components/Shell";
import { requireRH } from "@/lib/session";

const items = [
  { href: "/rh", label: "Visão geral", icon: "home" },
  { href: "/rh/solicitacoes", label: "Solicitações", icon: "calendar" },
  { href: "/rh/solicitacoes?status=APPROVED", label: "Aprovadas", icon: "check" },
  { href: "/rh/solicitacoes?status=REJECTED", label: "Reprovadas", icon: "x" },
  { href: "/rh/funcionarios", label: "Funcionários", icon: "users" },
  { href: "/rh/empresa", label: "Empresa e códigos", icon: "building" },
  { href: "/rh/avisos", label: "Avisos", icon: "bell" },
];

export default async function RhLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRH();

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
        profileHref: "/rh/perfil",
      }}
    >
      {children}
    </Shell>
  );
}
