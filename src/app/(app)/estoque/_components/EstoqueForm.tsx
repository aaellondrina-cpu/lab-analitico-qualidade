"use client";

import { useActionState, useState } from "react";
import { criarMovimentacao, type EstoqueFormState } from "../actions";

const initialState: EstoqueFormState = {};

export function EstoqueForm({
  lotes,
  clientes,
}: {
  lotes: { id: string; numero: string; produto: { codigo: string } }[];
  clientes: { id: string; razaoSocial: string }[];
}) {
  const [state, action, pending] = useActionState(criarMovimentacao, initialState);
  const [tipo, setTipo] = useState<"ENTRADA" | "SAIDA">("ENTRADA");

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
        <div className="flex gap-2">
          {(["ENTRADA", "SAIDA"] as const).map((t) => (
            <label key={t} className={
              "flex-1 rounded-md border px-3 py-2 cursor-pointer text-sm text-center " +
              (tipo === t ? "border-petroleo bg-petroleo/5 text-petroleo font-medium" : "border-slate-200 hover:bg-slate-50")
            }>
              <input type="radio" name="tipo" value={t} checked={tipo === t} onChange={() => setTipo(t)} className="sr-only" />
              {t === "ENTRADA" ? "Entrada (lote aprovado)" : "Saída (expedição)"}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Lote</label>
        <select name="loteId" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono">
          <option value="">Selecione...</option>
          {lotes.map((l) => <option key={l.id} value={l.id}>{l.numero} ({l.produto.codigo})</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Quantidade</label>
          <input name="quantidade" type="number" step="0.01" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Unidade</label>
          <select name="unidade" defaultValue="caixas" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="caixas">Caixas</option>
            <option value="unidades">Unidades</option>
            <option value="L">Litros</option>
            <option value="pallets">Pallets</option>
          </select>
        </div>
      </div>

      {tipo === "ENTRADA" ? (
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Localização no armazém</label>
          <input name="localizacao" placeholder="ex: Prateleira A-12" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      ) : (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Cliente destinatário</label>
            <select name="clienteId" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Selecione...</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.razaoSocial}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nº NF</label>
              <input name="notaFiscal" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Temperatura saída (°C)</label>
              <input name="temperaturaC" type="number" step="0.1" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Transportadora</label>
              <input name="transportadora" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Placa do veículo</label>
              <input name="placaVeiculo" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
        </>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Responsável</label>
        <input name="responsavel" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending}
        className="w-full rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60">
        {pending ? "Salvando..." : "Registrar movimentação"}
      </button>
    </form>
  );
}
