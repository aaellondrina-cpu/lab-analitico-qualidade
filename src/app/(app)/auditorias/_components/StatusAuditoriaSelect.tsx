"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { atualizarStatusAuditoria } from "../actions";

const OPTIONS = [
  { value: "PLANEJADA", label: "Planejada" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "AGUARDANDO_VERIFICACAO", label: "Aguardando verificação" },
  { value: "CONCLUIDA", label: "Concluída" },
] as const;

type StatusValue = (typeof OPTIONS)[number]["value"];

export function StatusAuditoriaSelect({ id, current }: { id: string; current: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <select
      value={current}
      onChange={(e) => {
        const next = e.target.value as StatusValue;
        if (next === current) return;
        startTransition(async () => {
          await atualizarStatusAuditoria(id, next);
          router.refresh();
        });
      }}
      disabled={pending}
      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-agua disabled:opacity-60"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
