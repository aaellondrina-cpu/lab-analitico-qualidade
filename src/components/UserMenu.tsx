"use client";

import { signOut, useSession } from "next-auth/react";

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  RESPONSAVEL_TECNICO: "Resp. Técnico",
  ANALISTA: "Analista",
  LEITURA: "Leitura",
};

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="px-3 py-2 text-xs text-slate-400">Carregando…</div>;
  }

  if (!session?.user) {
    return null;
  }

  const role = session.user.role ?? "ANALISTA";

  return (
    <div className="border-t border-slate-200 px-3 py-3">
      <div className="text-sm font-medium text-slate-800 truncate">
        {session.user.name ?? session.user.email}
      </div>
      <div className="text-[11px] uppercase tracking-wide text-agua mt-0.5">
        {roleLabel[role] ?? role}
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-2 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
      >
        Sair
      </button>
    </div>
  );
}
