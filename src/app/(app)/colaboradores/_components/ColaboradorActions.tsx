"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { alternarAtivo, excluirColaborador } from "../actions";

export function ColaboradorActions({ id, ativo }: { id: string; ativo: boolean }) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  function toggle() {
    setErr(null);
    startTransition(async () => {
      await alternarAtivo(id, !ativo);
      router.refresh();
    });
  }

  function remover() {
    if (!confirm("Excluir colaborador?")) return;
    setErr(null);
    startTransition(async () => {
      const res = await excluirColaborador(id);
      if (res?.message) {
        setErr(res.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className="text-xs text-slate-600 hover:underline disabled:opacity-60"
      >
        {ativo ? "Desativar" : "Reativar"}
      </button>
      <button
        type="button"
        onClick={remover}
        disabled={pending}
        className="text-xs text-red-600 hover:underline disabled:opacity-60"
      >
        Excluir
      </button>
      {err && <p className="text-[10px] text-red-600">{err}</p>}
    </div>
  );
}
