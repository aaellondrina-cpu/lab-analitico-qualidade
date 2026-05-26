"use client";

import { useState, useTransition } from "react";

type Props = {
  onConfirm: () => Promise<unknown>;
  label?: string;
  confirmText?: string;
  size?: "sm" | "md";
};

export function DeleteButton({
  onConfirm,
  label = "Excluir",
  confirmText = "Tem certeza? Esta ação não pode ser desfeita.",
  size = "md",
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!confirm(confirmText)) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = (await onConfirm()) as { message?: string } | undefined;
        if (res?.message) setError(res.message);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao excluir");
      }
    });
  }

  const cls =
    size === "sm"
      ? "rounded-md border border-red-300 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
      : "rounded-md border border-red-300 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60";

  return (
    <>
      <button type="button" onClick={handleClick} disabled={pending} className={cls}>
        {pending ? "Excluindo…" : label}
      </button>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </>
  );
}
