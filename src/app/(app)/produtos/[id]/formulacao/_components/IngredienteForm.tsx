"use client";

import { useActionState } from "react";
import { adicionarIngrediente, type FormulacaoState } from "../actions";

const initialState: FormulacaoState = {};

export function IngredienteForm({
  formulacaoId,
  insumos,
}: {
  formulacaoId: string;
  insumos: { id: string; nome: string; codigo: string }[];
}) {
  const [state, action, pending] = useActionState(adicionarIngrediente, initialState);

  return (
    <form action={action} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
      <input type="hidden" name="formulacaoId" value={formulacaoId} />
      <div className="md:col-span-2">
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Insumo</label>
        <select name="insumoId" className="w-full rounded-md border border-slate-300 px-2 py-2">
          <option value="">— Nome livre —</option>
          {insumos.map((i) => <option key={i.id} value={i.id}>{i.nome} ({i.codigo})</option>)}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Nome livre (se não cadastrado)</label>
        <input name="nomeLivre" className="w-full rounded-md border border-slate-300 px-2 py-2" />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Qtd / 1000L</label>
        <input name="quantidade" type="number" step="0.001" required className="w-full rounded-md border border-slate-300 px-2 py-2" />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Unidade</label>
        <select name="unidade" required defaultValue="kg" className="w-full rounded-md border border-slate-300 px-2 py-2">
          <option value="kg">kg</option><option value="L">L</option>
          <option value="g">g</option><option value="mL">mL</option>
        </select>
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Função</label>
        <select name="funcao" required defaultValue="acidulante" className="w-full rounded-md border border-slate-300 px-2 py-2">
          <option value="acidulante">Acidulante</option>
          <option value="conservante">Conservante</option>
          <option value="corante">Corante</option>
          <option value="edulcorante">Edulcorante</option>
          <option value="aromatizante">Aromatizante</option>
          <option value="materia_prima">Matéria-prima</option>
          <option value="outro">Outro</option>
        </select>
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">INS</label>
        <input name="ins" placeholder="ex: INS 211" className="w-full rounded-md border border-slate-300 px-2 py-2" />
      </div>
      <div className="md:col-span-2">
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Legislação</label>
        <input name="legislacao" placeholder="ex: RDC ANVISA 8/2013" className="w-full rounded-md border border-slate-300 px-2 py-2" />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">% formulação</label>
        <input name="percentual" type="number" step="0.001" className="w-full rounded-md border border-slate-300 px-2 py-2" />
      </div>
      <div className="md:col-span-2 flex items-end gap-3">
        <label className="text-xs flex items-center gap-2">
          <input type="checkbox" name="obrigatorio" defaultChecked /> Obrigatório
        </label>
        <button type="submit" disabled={pending}
          className="ml-auto rounded-md bg-petroleo px-3 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60">
          {pending ? "..." : "Adicionar"}
        </button>
      </div>
      {state.message && (
        <p className="md:col-span-4 rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">{state.message}</p>
      )}
    </form>
  );
}
