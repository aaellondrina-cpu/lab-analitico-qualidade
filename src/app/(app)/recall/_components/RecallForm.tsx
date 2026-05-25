"use client";

import { useActionState } from "react";
import { criarRecall, type RecallFormState } from "../actions";

const initialState: RecallFormState = {};

export function RecallForm({
  lotes,
}: {
  lotes: { id: string; numero: string; produto: { codigo: string; nome: string } }[];
}) {
  const [state, action, pending] = useActionState(criarRecall, initialState);

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Lotes afetados (selecione 1 ou mais)
        </label>
        <select name="lotes" multiple required size={6}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono">
          {lotes.map((l) => (
            <option key={l.id} value={l.id}>
              {l.numero} · {l.produto.codigo} ({l.produto.nome})
            </option>
          ))}
        </select>
        <p className="mt-1 text-[10px] text-slate-500">Segure Ctrl/Cmd para selecionar vários.</p>
        {state.errors?.lotesIds && <p className="mt-1 text-xs text-red-600">{state.errors.lotesIds[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Motivo</label>
          <select name="motivo" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="CONTAMINACAO">Contaminação microbiológica</option>
            <option value="NC_FISICOQUIMICA">NC físico-química</option>
            <option value="CORPO_ESTRANHO">Corpo estranho</option>
            <option value="ROTULAGEM">Rotulagem incorreta</option>
            <option value="OUTRO">Outro</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Nível</label>
          <select name="nivel" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="CLASSE_I">Classe I — risco grave (recolher já)</option>
            <option value="CLASSE_II">Classe II — risco moderado</option>
            <option value="CLASSE_III">Classe III — sem risco imediato</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Descrição do problema</label>
        <textarea name="descricao" rows={3} required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Data de identificação</label>
          <input name="dataIdentificacao" type="date" defaultValue={todayISO()} required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Responsável</label>
          <input name="responsavel" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Protocolo MAPA (se já comunicado)</label>
        <input name="protocoloMAPA" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending}
        className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">
        {pending ? "Abrindo..." : "Abrir recall"}
      </button>
    </form>
  );
}
