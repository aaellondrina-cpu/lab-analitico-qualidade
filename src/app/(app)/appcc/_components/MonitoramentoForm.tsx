"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { registrarMonitoramento, type MonitoramentoState } from "../actions";

const initialState: MonitoramentoState = {};

export function MonitoramentoForm({ pccId, unidade }: { pccId: string; unidade: string }) {
  const boundAction = registrarMonitoramento.bind(null, pccId);
  const [state, action, pending] = useActionState(boundAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form action={action} className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Valor medido ({unidade})</label>
          <input
            name="valor"
            type="number"
            step="any"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
          />
          {state.errors?.valor && <p className="mt-1 text-xs text-red-600">{state.errors.valor[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Responsável</label>
          <input
            name="responsavel"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
          />
          {state.errors?.responsavel && <p className="mt-1 text-xs text-red-600">{state.errors.responsavel[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Observação</label>
          <input
            name="observacao"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
          />
        </div>
      </div>

      {state.ok && state.ncCriada && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          ⚠ Valor fora do limite crítico — alerta de não conformidade registrado na trilha de auditoria.
        </p>
      )}
      {state.ok && !state.ncCriada && (
        <p className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700">
          ✓ Leitura conforme registrada.
        </p>
      )}
      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60"
      >
        {pending ? "Registrando…" : "Registrar leitura"}
      </button>
    </form>
  );
}
