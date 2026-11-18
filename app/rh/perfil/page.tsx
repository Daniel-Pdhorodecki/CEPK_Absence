import type { Metadata } from "next";

import { ProfileSettings } from "@/components/ProfileSettings";
import { requireRH } from "@/lib/session";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function RhProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  const user = await requireRH();
  const { ok, erro } = await searchParams;

  return (
    <ProfileSettings
      backHref="/rh"
      ok={ok}
      erro={erro}
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.company.name,
        hasAvatar: user.hasAvatar,
      }}
    />
  );
}
