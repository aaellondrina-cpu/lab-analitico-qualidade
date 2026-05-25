"use client";

import { useActionState, useState } from "react";
import { criarControleAgua, type AguaFormState } from "../actions";

const initialState: AguaFormState = {};

const PLACEHOLDERS: Record<string, string> = {
  DIARIO: '{"cloroResidualMgL": 1.2, "pH": 7.1, "turbidezUT": 0.5, "tempC": 22}',
  MENSAL: '{"coliformesTotais": "ausencia/100mL", "eColi": "ausencia/100mL", "corUH": 5, "condutividade": 230, "ferroMgL": 0.05}',
  SEMESTRAL: '{"laudo": "laboratorio externo credenciado", "parametros": 40}',
};

export function AguaForm() {
  const [state, action, pending] = useActionState(criarControleAgua, initialState);
  const [tipo, setTipo] = useState("DIARIO");

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
          <select name="tipo" required value={tipo} onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="DIARIO">Diário (cloro, pH, turbidez)</option>
            <option value="MENSAL">Mensal (microbiológicos + FQ)</option>
            <option value="SEMESTRAL">Semestral (laudo externo)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Data</label>
          <input name="data" type="date" defaultValue={todayISO()} required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Ponto</label>
          <input name="ponto" required placeholder="ex: Reservatório R1" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Responsável</label>
          <input name="responsavel" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Parâmetros medidos (JSON)</label>
        <textarea name="parametros" rows={3} placeholder={PLACEHOLDERS[tipo]}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono text-xs" />
        {state.errors?.parametros && <p className="mt-1 text-xs text-red-600">{state.errors.parametros[0]}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
        <select name="status" defaultValue="CONFORME" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="CONFORME">Conforme</option>
          <option value="ATENCAO">Atenção</option>
          <option value="NAO_CONFORME">Não conforme</option>
        </select>
      </div>

      {tipo === "SEMESTRAL" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nº do laudo externo</label>
            <input name="numeroLaudo" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">URL do laudo (PDF)</label>
            <input name="laudoUrl" placeholder="https://..." className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Observações</label>
        <textarea name="observacoes" rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending}
        className="w-full rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60">
        {pending ? "Salvando..." : "Registrar controle"}
      </button>
    </form>
  );
}
