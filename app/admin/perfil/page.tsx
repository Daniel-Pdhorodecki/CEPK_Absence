import type { Metadata } from "next";

import { ProfileSettings } from "@/components/ProfileSettings";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function AdminProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const user = await requireAdmin();
  const { ok, erro } = await searchParams;

  return (
    <ProfileSettings
      backHref="/admin"
      ok={ok}
      erro={erro}
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        staffType: user.staffType,
        position: user.position,
        companyName: user.company.name,
        hasAvatar: user.hasAvatar,
      }}
    />
  );
}
