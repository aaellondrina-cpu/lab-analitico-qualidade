"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Produto = { id: string; codigo: string; nome: string };

export function ProdutoFilter({ produtos }: { produtos: Produto[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get("produto") ?? "";

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(sp.toString());
    if (e.target.value) params.set("produto", e.target.value);
    else params.delete("produto");
    const q = params.toString();
    router.push(q ? `/lotes?${q}` : "/lotes");
  }

  return (
    <select
      value={current}
      onChange={onChange}
      className="rounded-md border border-slate-300 px-2 py-1 text-xs"
    >
      <option value="">Todos os produtos</option>
      {produtos.map((p) => (
        <option key={p.id} value={p.id}>
          {p.codigo} — {p.nome}
        </option>
      ))}
    </select>
  );
}
