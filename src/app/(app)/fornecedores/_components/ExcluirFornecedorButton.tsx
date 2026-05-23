"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { excluirFornecedor } from "../actions";

export function ExcluirFornecedorButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function onClick() {
    if (disabled) return;
    if (!confirm("Excluir este fornecedor?")) return;
    setError(null);
    startTransition(async () => {
      const res = await excluirFornecedor(id);
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
        disabled={pending || disabled}
        title={disabled ? "Fornecedor possui insumos vinculados" : "Excluir fornecedor"}
        className="text-xs text-red-600 hover:underline disabled:text-slate-300 disabled:no-underline disabled:cursor-not-allowed"
      >
        {pending ? "Excluindo…" : "Excluir"}
      </button>
      {error && <span className="mt-1 text-[10px] text-red-600">{error}</span>}
    </div>
  );
}
