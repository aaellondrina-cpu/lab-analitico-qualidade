"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recalcularCartas } from "../actions";

export function RecalcularButton() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  function onClick() {
    setMsg(null);
    startTransition(async () => {
      const res = await recalcularCartas();
      if (res.ok) {
        setMsg(`${res.recalculadas} carta(s) recalculada(s).`);
        router.refresh();
      } else {
        setMsg("Erro ao recalcular.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60"
      >
        {pending ? "Recalculando…" : "↻ Recalcular cartas"}
      </button>
      {msg && <p className="text-[11px] text-slate-500">{msg}</p>}
    </div>
  );
}
