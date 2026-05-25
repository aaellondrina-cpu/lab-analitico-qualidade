"use client";

import { useActionState } from "react";
import { criarPonto, type TempFormState } from "../actions";

const initialState: TempFormState = {};

export function PontoForm() {
  const [state, action, pending] = useActionState(criarPonto, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Nome do ponto</label>
        <input name="nome" required placeholder="ex: Câmara Fria 1" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
        <select name="tipo" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="CAMARA_FRIA">Câmara fria</option>
          <option value="ARMAZEM">Armazém</option>
          <option value="AREA_PRODUCAO">Área de produção</option>
          <option value="CAMARA_RETENCAO">Câmara de retenção</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Temp. mínima (°C)</label>
          <input name="tempMin" type="number" step="0.1" required defaultValue="2" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Temp. máxima (°C)</label>
          <input name="tempMax" type="number" step="0.1" required defaultValue="8" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Frequência (horas)</label>
          <input name="frequenciaH" type="number" min="1" placeholder="ex: 4" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Responsável padrão</label>
          <input name="responsavel" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending}
        className="w-full rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60">
        {pending ? "Salvando..." : "Cadastrar ponto"}
      </button>
    </form>
  );
}
