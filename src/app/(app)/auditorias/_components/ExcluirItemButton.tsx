"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { excluirItem } from "../actions";

export function ExcluirItemButton({
  itemId,
  auditoriaId,
}: {
  itemId: string;
  auditoriaId: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    if (!confirm("Excluir este item do checklist?")) return;
    startTransition(async () => {
      await excluirItem(itemId, auditoriaId);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-[11px] text-red-600 hover:underline disabled:opacity-60 shrink-0"
    >
      {pending ? "…" : "Excluir"}
    </button>
  );
}
