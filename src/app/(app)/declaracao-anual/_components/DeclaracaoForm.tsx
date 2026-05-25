"use client";

import { useActionState } from "react";
import { criarDeclaracao, type DeclaracaoFormState } from "../actions";

const initialState: DeclaracaoFormState = {};

export function DeclaracaoForm({ produtos }: { produtos: { id: string; codigo: string; nome: string }[] }) {
  const [state, action, pending] = useActionState(criarDeclaracao, initialState);
  const anoAtual = new Date().getFullYear();

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Ano de referência</label>
          <input name="ano" type="number" required defaultValue={anoAtual - 1} min={2020} max={2100}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
          <select name="status" defaultValue="PENDENTE" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="PENDENTE">Pendente</option>
            <option value="ENVIADA">Enviada</option>
            <option value="CONFIRMADA">Confirmada pela SFA</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Produto</label>
        <select name="produtoId" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Selecione...</option>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>{p.codigo} — {p.nome}</option>
          ))}
        </select>
        {state.errors?.produtoId && <p className="mt-1 text-xs text-red-600">{state.errors.produtoId[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Quantidade produzida</label>
          <input name="qtdProduzida" type="number" step="0.01" required defaultValue="0"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Quantidade vendida</label>
          <input name="qtdVendida" type="number" step="0.01" required defaultValue="0"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Estoque em 31/dezembro</label>
          <input name="estoque" type="number" step="0.01" required defaultValue="0"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Unidade</label>
          <select name="unidade" required defaultValue="L" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="L">Litros (L)</option>
            <option value="un">Unidades</option>
            <option value="kg">Quilos (kg)</option>
            <option value="m3">m³</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Observações</label>
        <textarea name="observacoes" rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending}
        className="w-full rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60">
        {pending ? "Salvando..." : "Salvar declaração"}
      </button>
    </form>
  );
}
