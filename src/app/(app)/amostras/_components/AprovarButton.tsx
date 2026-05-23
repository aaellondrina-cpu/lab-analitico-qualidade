"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { aprovarAmostra } from "../actions";

export function AprovarButton({ id, canApprove }: { id: string; canApprove: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!canApprove) {
    return (
      <button
        type="button"
        disabled
        title="Apenas Responsável Técnico ou Admin podem aprovar"
        className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
      >
        Aprovar amostra
      </button>
    );
  }

  function onClick() {
    if (!confirm("Aprovar esta amostra? Esta ação fica registrada na trilha de auditoria.")) return;
    setError(null);
    startTransition(async () => {
      const res = await aprovarAmostra(id);
      if (res?.message) {
        setError(res.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Aprovando…" : "✓ Aprovar amostra"}
      </button>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
