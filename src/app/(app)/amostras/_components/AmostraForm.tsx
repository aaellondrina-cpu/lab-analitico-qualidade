"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { criarAmostra, type AmostraFormState } from "../actions";
import { TIPOS_ANALISE } from "@/lib/constants";

type Cliente = { id: string; razaoSocial: string };
type Lote = { id: string; numero: string; produtoId: string; sabor: string | null; status: string };
type Produto = { id: string; codigo: string; nome: string };
type Ponto = { id: string; nome: string };

const initialState: AmostraFormState = {};

export function AmostraForm({
  clientes,
  produtos,
  lotes,
  pontos,
}: {
  clientes: Cliente[];
  produtos: Produto[];
  lotes: Lote[];
  pontos: Ponto[];
}) {
  const [state, action, pending] = useActionState(criarAmostra, initialState);
  const [produtoId, setProdutoId] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.push("/amostras");
      router.refresh();
    }
  }, [state.ok, router]);

  const lotesFiltrados = useMemo(
    () => (produtoId ? lotes.filter((l) => l.produtoId === produtoId) : lotes),
    [produtoId, lotes],
  );

  if (clientes.length === 0 || produtos.length === 0 || lotes.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-medium mb-2">Cadastros pendentes:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          {clientes.length === 0 && <li>Cadastre pelo menos um cliente</li>}
          {produtos.length === 0 && <li>Cadastre pelo menos um produto com especificações</li>}
          {lotes.length === 0 && <li>Cadastre pelo menos um lote de produção</li>}
        </ul>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Cliente</label>
          <select name="clienteId" required defaultValue="" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="" disabled>Selecione…</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.razaoSocial}</option>)}
          </select>
          {state.errors?.clienteId && <p className="mt-1 text-xs text-red-600">{state.errors.clienteId[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Produto</label>
          <select
            name="produtoId"
            required
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>Selecione…</option>
            {produtos.map((p) => <option key={p.id} value={p.id}>{p.codigo} — {p.nome}</option>)}
          </select>
          {state.errors?.produtoId && <p className="mt-1 text-xs text-red-600">{state.errors.produtoId[0]}</p>}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Lote {produtoId && lotesFiltrados.length === 0 && <span className="text-amber-600">(sem lotes para este produto)</span>}
          </label>
          <select name="loteId" required defaultValue="" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="" disabled>Selecione…</option>
            {lotesFiltrados.map((l) => (
              <option key={l.id} value={l.id}>
                {l.numero}{l.sabor ? ` · ${l.sabor}` : ""} ({l.status})
              </option>
            ))}
          </select>
          {state.errors?.loteId && <p className="mt-1 text-xs text-red-600">{state.errors.loteId[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Ponto de coleta</label>
          <select name="pontoColetaId" defaultValue="" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">— Não informado —</option>
            {pontos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Tipo de análise</label>
          <select name="tipoAnalise" required defaultValue="ROTINA" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            {TIPOS_ANALISE.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Quantidade</label>
          <input name="quantidade" type="number" min={1} defaultValue={1} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Volume</label>
          <input name="volume" placeholder="500mL × 3" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Temp. transporte (°C)</label>
          <input name="tempTransporte" type="number" step="0.1" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div className="flex items-center pt-6">
          <label className="inline-flex items-center gap-2 text-xs text-slate-700">
            <input name="integridadeOk" type="checkbox" defaultChecked />
            Embalagem íntegra
          </label>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Responsável coleta</label>
          <input name="responsavelColeta" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Nome" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Data/hora coleta</label>
          <input name="dataColeta" type="datetime-local" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          {state.errors?.dataColeta && <p className="mt-1 text-xs text-red-600">{state.errors.dataColeta[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Prazo entrega laudo</label>
          <input name="prazoEntrega" type="datetime-local" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          {state.errors?.prazoEntrega && <p className="mt-1 text-xs text-red-600">{state.errors.prazoEntrega[0]}</p>}
        </div>
      </section>

      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={pending} className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60">
          {pending ? "Registrando…" : "Registrar amostra"}
        </button>
        <button type="button" onClick={() => router.push("/amostras")} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          Cancelar
        </button>
      </div>

      <p className="text-xs text-slate-400 pt-1">
        Número de OS será gerado automaticamente no formato <code className="font-mono">OS-{new Date().getFullYear()}-NNNN</code>.
      </p>
    </form>
  );
}
