"use client";

import { useActionState } from "react";
import { criarRotulo, type RotuloFormState } from "../actions";
import { CHECKLIST_ITEMS } from "../checklist";

const initialState: RotuloFormState = {};

const grupos = Array.from(new Set(CHECKLIST_ITEMS.map((i) => i.grupo)));

export function RotuloForm({ produtos }: { produtos: { id: string; codigo: string; nome: string }[] }) {
  const [state, action, pending] = useActionState(criarRotulo, initialState);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Produto</label>
          <select name="produtoId" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">Selecione...</option>
            {produtos.map((p) => <option key={p.id} value={p.id}>{p.codigo} — {p.nome}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Quantidade recebida</label>
          <input name="quantidade" type="number" min="1" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Fornecedor</label>
          <input name="fornecedor" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Lote do fornecedor</label>
          <input name="loteFornecedor" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Nº NF</label>
          <input name="numeroNF" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      {/* Checklist por grupo */}
      <div className="space-y-3">
        {grupos.map((g) => (
          <fieldset key={g} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <legend className="px-1 text-[10px] uppercase tracking-wider text-slate-500 font-medium">{g}</legend>
            <div className="grid grid-cols-1 gap-2">
              {CHECKLIST_ITEMS.filter((i) => i.grupo === g).map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-8">{item.label}</div>
                  <div className="col-span-4 flex gap-1">
                    {(["CONFORME", "NAO_CONFORME", "NA"] as const).map((opt) => (
                      <label key={opt} className="flex-1 cursor-pointer">
                        <input type="radio" name={`item-${item.id}`} value={opt}
                          defaultChecked={opt === "NA"} className="sr-only peer" />
                        <span className={
                          "block rounded px-1.5 py-1 text-center text-[10px] border " +
                          (opt === "CONFORME" ? "peer-checked:border-emerald-400 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 border-slate-200 text-slate-500" :
                           opt === "NAO_CONFORME" ? "peer-checked:border-red-400 peer-checked:bg-red-50 peer-checked:text-red-700 border-slate-200 text-slate-500" :
                           "peer-checked:border-slate-400 peer-checked:bg-white peer-checked:text-slate-700 border-slate-200 text-slate-500")
                        }>
                          {opt === "CONFORME" ? "✓" : opt === "NAO_CONFORME" ? "✗" : "—"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
          <select name="status" defaultValue="EM_ANALISE" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="EM_ANALISE">Em análise</option>
            <option value="APROVADO">Aprovado</option>
            <option value="APROVADO_COM_RESSALVA">Aprovado com ressalva</option>
            <option value="REPROVADO">Reprovado</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">URL da arte aprovada</label>
          <input name="arteUrl" placeholder="https://..." className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
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
        {pending ? "Salvando..." : "Registrar lote de rótulo"}
      </button>
    </form>
  );
}
