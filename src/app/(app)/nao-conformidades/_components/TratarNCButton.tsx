"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { encerrarNC, iniciarTratamento, type TratarNCState } from "../actions";

const ACOES = [
  { value: "LIBERAR", label: "Liberar lote" },
  { value: "RETER", label: "Reter lote" },
  { value: "REPROCESSAR", label: "Reprocessar" },
  { value: "DESCARTE", label: "Descartar" },
  { value: "REVISAR", label: "Revisar análise" },
];

const initialState: TratarNCState = {};

export function TratarNC({ id, status, canEncerrar }: { id: string; status: string; canEncerrar: boolean }) {
  const [open, setOpen] = useState(false);
  const boundAction = iniciarTratamento.bind(null, id);
  const [state, action, pending] = useActionState(boundAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state.ok, router]);

  const [encerrarPending, startEncerrar] = useTransition();
  const [encerrarError, setEncerrarError] = useState<string | null>(null);

  function encerrar() {
    if (!confirm("Encerrar esta NC? Esta ação fica registrada na auditoria.")) return;
    setEncerrarError(null);
    startEncerrar(async () => {
      const res = await encerrarNC(id);
      if (res?.message) {
        setEncerrarError(res.message);
        return;
      }
      router.refresh();
    });
  }

  if (status === "ENCERRADA") {
    return <span className="text-xs text-slate-400">Encerrada</span>;
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-end">
        {status === "ABERTA" && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded px-2 py-1 text-[11px] bg-blue-600 text-white hover:bg-blue-700"
          >
            {open ? "Fechar form" : "Iniciar tratamento"}
          </button>
        )}
        {status === "EM_TRATAMENTO" && canEncerrar && (
          <button
            type="button"
            disabled={encerrarPending}
            onClick={encerrar}
            className="rounded px-2 py-1 text-[11px] bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {encerrarPending ? "Encerrando…" : "Encerrar NC"}
          </button>
        )}
      </div>
      {encerrarError && <p className="text-[10px] text-red-600 text-right">{encerrarError}</p>}

      {open && (
        <form action={action} className="rounded-md border border-blue-200 bg-blue-50 p-3 space-y-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Causa raiz</label>
            <input
              name="causaRaiz"
              required
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
              placeholder="Ex: Falha na pasteurização"
            />
            {state.errors?.causaRaiz && <p className="text-[10px] text-red-600">{state.errors.causaRaiz[0]}</p>}
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Ação imediata</label>
            <select name="acao" required defaultValue="" className="w-full rounded border border-slate-300 px-2 py-1 text-xs">
              <option value="" disabled>Selecione…</option>
              {ACOES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
            {state.errors?.acao && <p className="text-[10px] text-red-600">{state.errors.acao[0]}</p>}
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">Ação corretiva</label>
            <textarea
              name="acaoCorretiva"
              required
              rows={2}
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
              placeholder="Plano para evitar recorrência"
            />
            {state.errors?.acaoCorretiva && <p className="text-[10px] text-red-600">{state.errors.acaoCorretiva[0]}</p>}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? "Salvando…" : "Iniciar tratamento"}
          </button>
        </form>
      )}
    </div>
  );
}
