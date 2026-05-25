"use client";

import { useActionState } from "react";
import { criarFormulacao, type FormulacaoState } from "../actions";

const initialState: FormulacaoState = {};

export function FormulacaoForm({ produtoId }: { produtoId: string }) {
  const [state, action, pending] = useActionState(criarFormulacao, initialState);
  function todayISO() { return new Date().toISOString().slice(0, 10); }

  return (
    <form action={action} className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <input type="hidden" name="produtoId" value={produtoId} />
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Aprovada por</label>
        <input name="aprovadaPor" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Data aprovação</label>
        <input name="dataAprovacao" type="date" defaultValue={todayISO()} required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">&nbsp;</label>
        <button type="submit" disabled={pending}
          className="w-full rounded-md bg-petroleo px-3 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60">
          {pending ? "..." : "Criar nova versão"}
        </button>
      </div>
      <div className="md:col-span-3">
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Observações</label>
        <input name="observacoes" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      {state.message && (
        <p className="md:col-span-3 rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">{state.message}</p>
      )}
    </form>
  );
}
