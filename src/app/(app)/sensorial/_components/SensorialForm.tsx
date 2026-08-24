"use client";

import { useActionState } from "react";
import { criarSensorial, type SensorialFormState } from "../actions";

const initialState: SensorialFormState = {};

function ScaleInput({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
      <select name={name} required className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm">
        <option value="">—</option>
        <option value="1">1 — Desgostei muitíssimo</option>
        <option value="2">2</option>
        <option value="3">3 — Desgostei</option>
        <option value="4">4</option>
        <option value="5">5 — Indiferente</option>
        <option value="6">6</option>
        <option value="7">7 — Gostei</option>
        <option value="8">8</option>
        <option value="9">9 — Gostei muitíssimo</option>
      </select>
    </div>
  );
}

export function SensorialForm({ lotes }: { lotes: { id: string; numero: string; produto: { codigo: string } }[] }) {
  const [state, action, pending] = useActionState(criarSensorial, initialState);

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Lote avaliado</label>
          <select name="loteId" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono">
            <option value="">Selecione...</option>
            {lotes.map((l) => <option key={l.id} value={l.id}>{l.numero} ({l.produto.codigo})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Data da avaliação</label>
          <input name="data" type="date" defaultValue={todayISO()} required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Avaliador</label>
          <input name="avaliador" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Produto referência (opcional)</label>
          <input name="produtoReferencia" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <fieldset className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-3">
        <legend className="px-1 text-[10px] uppercase tracking-wider text-slate-500 font-medium">Escala hedônica (1-9)</legend>
        <div className="grid grid-cols-2 gap-3">
          <ScaleInput name="aparencia" label="Aparência" />
          <ScaleInput name="cor" label="Cor" />
          <ScaleInput name="odor" label="Odor / Aroma" />
          <ScaleInput name="sabor" label="Sabor" />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Acidez (se aplicável)</label>
            <select name="acidez" className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm">
              <option value="">—</option>
              <option value="1">1 — Muito ácido</option>
              <option value="2">2</option>
              <option value="3">3 — Ácido</option>
              <option value="4">4</option>
              <option value="5">5 — Equilibrado</option>
              <option value="6">6</option>
              <option value="7">7 — Pouco ácido</option>
              <option value="8">8</option>
              <option value="9">9 — Não ácido</option>
            </select>
          </div>
          <ScaleInput name="carbonatacao" label="Carbonatação (se aplicável)" />
          <ScaleInput name="corpo" label="Corpo / Textura (se aplicável)" />
          <ScaleInput name="impressaoGlobal" label="Impressão global" />
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Parecer</label>
          <select name="parecer" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="APROVADO">Aprovado</option>
            <option value="APROVADO_COM_RESSALVA">Aprovado com ressalva</option>
            <option value="REPROVADO">Reprovado</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Comparação c/ padrão</label>
          <select name="comparacaoPadrao" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">—</option>
            <option value="IGUAL">Igual</option>
            <option value="SUPERIOR">Superior</option>
            <option value="INFERIOR">Inferior</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Desvios percebidos</label>
        <textarea name="desvios" rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Observações do painel</label>
        <textarea name="observacoes" rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending}
        className="w-full rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60">
        {pending ? "Salvando..." : "Salvar avaliação"}
      </button>
    </form>
  );
}
