"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { atualizarStatusEmbalagem } from "../actions";

const OPTIONS = [
  { value: "EM_ANALISE", label: "Em análise" },
  { value: "APROVADA", label: "Aprovada" },
  { value: "REPROVADA", label: "Reprovada" },
  { value: "DESCARTE", label: "Descarte" },
] as const;

type StatusValue = (typeof OPTIONS)[number]["value"];

export function StatusEmbalagemSelect({
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
      await atualizarStatusEmbalagem(id, next);
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
