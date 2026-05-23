"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { atualizarStatusLote } from "../actions";

const TRANSITIONS: Record<string, { label: string; to: string; color: string }[]> = {
  EM_PRODUCAO: [
    { label: "Finalizar", to: "FINALIZADO", color: "bg-slate-600 text-white hover:bg-slate-700" },
  ],
  FINALIZADO: [
    { label: "Liberar", to: "LIBERADO", color: "bg-emerald-600 text-white hover:bg-emerald-700" },
    { label: "Reter", to: "RETIDO", color: "bg-amber-500 text-white hover:bg-amber-600" },
  ],
  LIBERADO: [
    { label: "Reter", to: "RETIDO", color: "bg-amber-500 text-white hover:bg-amber-600" },
  ],
  RETIDO: [
    { label: "Liberar", to: "LIBERADO", color: "bg-emerald-600 text-white hover:bg-emerald-700" },
    { label: "Descartar", to: "DESCARTADO", color: "bg-red-600 text-white hover:bg-red-700" },
  ],
};

export function LoteStatusActions({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const transitions = TRANSITIONS[status] ?? [];

  if (transitions.length === 0) return null;

  function go(to: string, label: string) {
    if (!confirm(`Mudar status para "${label}"?`)) return;
    startTransition(async () => {
      await atualizarStatusLote(id, to);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-1 justify-end">
      {transitions.map((t) => (
        <button
          key={t.to}
          type="button"
          disabled={pending}
          onClick={() => go(t.to, t.label)}
          className={`rounded px-2 py-1 text-[10px] uppercase tracking-wide disabled:opacity-50 ${t.color}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
