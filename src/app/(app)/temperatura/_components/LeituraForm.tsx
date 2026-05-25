"use client";

import { useActionState } from "react";
import { registrarLeitura, type TempFormState } from "../actions";

const initialState: TempFormState = {};

export function LeituraForm({
  pontos,
}: {
  pontos: { id: string; nome: string; tempMin: number; tempMax: number }[];
}) {
  const [state, action, pending] = useActionState(registrarLeitura, initialState);

  return (
    <form action={action} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
      <div className="md:col-span-2">
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Ponto</label>
        <select name="pontoId" required className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm">
          <option value="">Selecione...</option>
          {pontos.map((p) => (
            <option key={p.id} value={p.id}>{p.nome} ({p.tempMin}—{p.tempMax}°C)</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Temp. (°C)</label>
        <input name="temperatura" type="number" step="0.1" required className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Responsável</label>
        <input name="responsavel" required className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm" />
      </div>
      <div>
        <button type="submit" disabled={pending}
          className="w-full rounded-md bg-petroleo px-3 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60">
          {pending ? "..." : "Registrar"}
        </button>
      </div>
      {state.message && (
        <p className="md:col-span-5 rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">{state.message}</p>
      )}
    </form>
  );
}
