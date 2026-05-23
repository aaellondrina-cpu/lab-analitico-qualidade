"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { excluirEquipamento, recalcularStatusEquipamentos } from "../actions";

export function ExcluirEquipamentoButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function onClick() {
    if (!confirm("Excluir este equipamento?")) return;
    setError(null);
    startTransition(async () => {
      const res = await excluirEquipamento(id);
      if (res?.message) {
        setError(res.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="text-xs text-red-600 hover:underline disabled:text-slate-300"
      >
        {pending ? "Excluindo…" : "Excluir"}
      </button>
      {error && <span className="mt-1 text-[10px] text-red-600">{error}</span>}
    </div>
  );
}

export function RecalcularButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => { await recalcularStatusEquipamentos(); router.refresh(); })}
      className="text-xs text-slate-600 hover:text-petroleo hover:underline disabled:opacity-60"
    >
      {pending ? "Recalculando…" : "↻ Recalcular status"}
    </button>
  );
}
