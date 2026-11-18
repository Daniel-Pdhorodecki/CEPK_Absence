import Link from "next/link";

import { removeAvatarAction, uploadAvatarAction } from "@/app/actions/profile";
import { Avatar } from "@/components/Avatar";

export function ProfileSettings({
  user,
  backHref,
  ok,
  erro,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    companyName: string;
    hasAvatar: boolean;
  };
  backHref: string;
  ok?: string;
  erro?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Conta</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-4xl">
            Meu perfil
          </h1>
          <p className="mt-2 helper">
            Sua foto aparece na sidebar e nos painéis da empresa.
          </p>
        </div>
        <Link href={backHref} className="btn-secondary btn-sm">
          Voltar
        </Link>
      </div>

      {ok ? <div className="alert-success">{ok}</div> : null}
      {erro ? <div className="alert-error">{erro}</div> : null}

      <section className="card">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar
            userId={user.id}
            name={user.name}
            hasAvatar={user.hasAvatar}
            className="size-20"
            textClassName="text-xl"
          />
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-[var(--text)]">{user.name}</h2>
            <p className="mt-0.5 truncate text-sm text-[var(--muted)]">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="badge bg-[var(--surface-3)] text-[var(--muted)]">
                {user.role === "RH" ? "RH" : "Funcionário"}
              </span>
              <span className="badge border border-[var(--border-strong)] text-[var(--muted)]">
                {user.companyName}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <h3 className="section-title">Foto de perfil</h3>
          <p className="mt-1 helper">JPG, PNG ou WebP até 2 MB.</p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <form action={uploadAvatarAction} className="flex flex-wrap items-end gap-2">
              <div className="min-w-0">
                <label htmlFor="avatar" className="label">
                  {user.hasAvatar ? "Trocar foto" : "Adicionar foto"}
                </label>
                <input
                  id="avatar"
                  name="avatar"
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  className="input max-w-xs file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-[var(--btn-bg)] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[var(--btn-fg)]"
                />
              </div>
              <button type="submit" className="btn-primary btn-sm">
                Salvar foto
              </button>
            </form>

            {user.hasAvatar ? (
              <form action={removeAvatarAction}>
                <button type="submit" className="btn-danger btn-sm">
                  Remover foto
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
