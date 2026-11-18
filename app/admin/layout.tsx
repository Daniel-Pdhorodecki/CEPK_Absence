import { Shell } from "@/components/Shell";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const pending = await prisma.user.count({
    where: { companyId: user.companyId, status: "PENDING" },
  });

  const items = [
    { href: "/admin", label: "Visão geral", icon: "home" },
    { href: "/admin/solicitacoes", label: "Solicitações", icon: "calendar" },
    { href: "/admin/solicitacoes?status=APPROVED", label: "Aprovadas", icon: "check" },
    { href: "/admin/solicitacoes?status=REJECTED", label: "Reprovadas", icon: "x" },
    {
      href: "/admin/cadastros",
      label: "Cadastros",
      icon: "clipboard",
      badge: pending,
    },
    { href: "/admin/funcionarios", label: "Equipe", icon: "users" },
    { href: "/admin/avisos", label: "Avisos", icon: "bell" },
  ];

  return (
    <Shell
      items={items}
      user={{
        id: user.id,
        name: user.name,
        role: user.role,
        staffType: user.staffType,
        position: user.position,
        companyName: user.company.name,
        hasAvatar: user.hasAvatar,
        profileHref: "/admin/perfil",
      }}
    >
      {children}
    </Shell>
  );
}
