"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { atualizarResultadoAuditoria } from "../actions";

const OPTIONS = [
  { value: "", label: "— não definido —" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "APROVADO_COM_RESSALVAS", label: "Aprovado c/ ressalvas" },
  { value: "REPROVADO", label: "Reprovado" },
] as const;

type ResultadoValue = "" | "APROVADO" | "APROVADO_COM_RESSALVAS" | "REPROVADO";

export function ResultadoAuditoriaSelect({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <select
      value={current}
      onChange={(e) => {
        const next = e.target.value as ResultadoValue;
        if (next === current) return;
        startTransition(async () => {
          await atualizarResultadoAuditoria(id, next);
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
