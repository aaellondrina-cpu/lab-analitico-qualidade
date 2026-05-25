"use client";

import { useActionState } from "react";
import { criarSAC, type SACFormState } from "../actions";

const initialState: SACFormState = {};

export function SACForm({ clientes }: { clientes: { id: string; razaoSocial: string; cnpj: string }[] }) {
  const [state, action, pending] = useActionState(criarSAC, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Cliente</label>
        <select name="clienteId" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Selecione...</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.razaoSocial} ({c.cnpj})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Canal</label>
          <select name="canal" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="EMAIL">E-mail</option>
            <option value="TELEFONE">Telefone</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="PRESENCIAL">Presencial</option>
            <option value="PORTAL">Portal</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Urgência</label>
          <select name="urgencia" defaultValue="MEDIA" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="BAIXA">Baixa (10 dias úteis)</option>
            <option value="MEDIA">Média (5 dias úteis)</option>
            <option value="ALTA">Alta (48h)</option>
            <option value="CRITICA">Crítica (24h)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Tipo de reclamação</label>
        <select name="tipo" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="QUALIDADE">Qualidade do produto (sabor, cor, odor, carbonatação)</option>
          <option value="CORPO_ESTRANHO">Corpo estranho</option>
          <option value="EMBALAGEM">Embalagem danificada</option>
          <option value="VALIDADE">Prazo de validade</option>
          <option value="ROTULAGEM">Rotulagem incorreta</option>
          <option value="ATRASO">Atraso na entrega</option>
          <option value="DOCUMENTACAO">Documentação (laudo, NF)</option>
          <option value="OUTRO">Outro</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Produto</label>
          <input name="produto" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Lote (se informado)</label>
          <input name="lote" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Descrição</label>
        <textarea name="descricao" rows={4} required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        {state.errors?.descricao && <p className="mt-1 text-xs text-red-600">{state.errors.descricao[0]}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">URL evidência (foto/PDF)</label>
        <input name="evidenciaUrl" placeholder="https://..." className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending}
        className="w-full rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60">
        {pending ? "Salvando..." : "Abrir reclamação"}
      </button>
    </form>
  );
}
