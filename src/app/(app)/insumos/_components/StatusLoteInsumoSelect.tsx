"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { atualizarStatusLoteInsumo } from "../actions";

const OPTIONS = [
  { value: "EM_ANALISE", label: "Em análise" },
  { value: "APROVADO", label: "Aprovado" },
  { value: "REPROVADO", label: "Reprovado" },
  { value: "QUARENTENA", label: "Quarentena" },
] as const;

type StatusValue = (typeof OPTIONS)[number]["value"];

export function StatusLoteInsumoSelect({
  id,
  current,
  className,
}: {
  id: string;
  current: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as StatusValue;
    if (next === current) return;
    startTransition(async () => {
      await atualizarStatusLoteInsumo(id, next);
      router.refresh();
    });
  }

  return (
    <select
      value={current}
      onChange={onChange}
      disabled={pending}
      className={
        "rounded-md border px-2 py-1 text-xs disabled:opacity-60 " +
        (className ?? "border-slate-300")
      }
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
