"use client";

import { useActionState, useState } from "react";
import { criarRegistroBPF, type BPFFormState } from "../actions";

const ETAPAS = [
  { value: "XAROPE_SIMPLES", label: "Xarope simples", placeholder: '{"litros": 1500, "brixSimples": 65}' },
  { value: "XAROPE_COMPOSTO", label: "Xarope composto", placeholder: '{"litros": 2000, "ingredientes": ["concentrado", "acidulante"]}' },
  { value: "CARBONATACAO", label: "Carbonatação", placeholder: '{"volCO2": 3.5, "pressaoBar": 4.2, "tempC": 4}' },
  { value: "ENVASE", label: "Envase", placeholder: '{"linha": "Linha 1", "velocidadeUph": 12000, "vazoes": "OK"}' },
  { value: "HIGIENE", label: "Higiene pessoal", placeholder: '{"manipuladoresOk": true, "epis": "OK"}' },
  { value: "LIMPEZA", label: "Limpeza / sanitização", placeholder: '{"superficie": "Enchedora", "agente": "NaOH 2%", "tempo": "15min"}' },
  { value: "TEMPERATURA", label: "Controle de temperatura", placeholder: '{"localCamara": "Câmara fria", "tempC": 4}' },
  { value: "PRAGAS", label: "Controle de pragas", placeholder: '{"pontoIscagem": "P12", "evidencia": "nenhuma"}' },
];

const initialState: BPFFormState = {};

export function BPFForm({ lotes }: { lotes: { id: string; numero: string }[] }) {
  const [state, action, pending] = useActionState(criarRegistroBPF, initialState);
  const [etapa, setEtapa] = useState(ETAPAS[0].value);

  const placeholder = ETAPAS.find((e) => e.value === etapa)?.placeholder ?? "";

  function dateTimeLocalNow() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Etapa / controle</label>
        <select name="etapa" value={etapa} onChange={(e) => setEtapa(e.target.value)} required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          {ETAPAS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Data e hora</label>
          <input name="data" type="datetime-local" required defaultValue={dateTimeLocalNow()}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Responsável</label>
          <input name="responsavel" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Lote vinculado (opcional)</label>
        <select name="loteId" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">— Não aplicável —</option>
          {lotes.map((l) => <option key={l.id} value={l.id}>{l.numero}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Parâmetros (JSON)</label>
        <textarea name="parametros" rows={3} placeholder={placeholder}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono text-xs" />
        {state.errors?.parametros && <p className="mt-1 text-xs text-red-600">{state.errors.parametros[0]}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Observações</label>
        <textarea name="observacoes" rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending}
        className="w-full rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60">
        {pending ? "Salvando..." : "Salvar registro"}
      </button>
    </form>
  );
}
