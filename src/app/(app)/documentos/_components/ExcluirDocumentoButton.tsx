"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { excluirDocumento } from "../actions";

export function ExcluirDocumentoButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  function onClick() {
    if (!confirm("Excluir documento? Esta ação fica registrada na auditoria.")) return;
    setErr(null);
    startTransition(async () => {
      const res = await excluirDocumento(id);
      if (res?.message) {
        setErr(res.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="text-xs text-red-600 hover:underline disabled:opacity-60"
      >
        {pending ? "Excluindo…" : "Excluir"}
      </button>
      {err && <p className="text-[10px] text-red-600">{err}</p>}
    </div>
  );
}
