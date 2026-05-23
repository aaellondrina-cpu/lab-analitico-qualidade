"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { criarLote, type LoteFormState } from "../actions";

type ProdutoLite = { id: string; nome: string; codigo: string; sabor: string | null };

const initialState: LoteFormState = {};

export function LoteForm({ produtos }: { produtos: ProdutoLite[] }) {
  const [state, action, pending] = useActionState(criarLote, initialState);
  const [produtoId, setProdutoId] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.push("/lotes");
      router.refresh();
    }
  }, [state.ok, router]);

  const produtoSelecionado = produtos.find((p) => p.id === produtoId);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Número do lote</label>
          <input
            name="numero"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono uppercase"
            placeholder="LT-2026-05-23-001"
          />
          {state.errors?.numero && <p className="mt-1 text-xs text-red-600">{state.errors.numero[0]}</p>}
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
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.codigo} — {p.nome}{p.sabor ? ` (${p.sabor})` : ""}
              </option>
            ))}
          </select>
          {state.errors?.produtoId && <p className="mt-1 text-xs text-red-600">{state.errors.produtoId[0]}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Sabor <span className="text-slate-400 font-normal">(opcional — sobrescreve sabor padrão do produto)</span>
        </label>
        <input
          name="sabor"
          defaultValue={produtoSelecionado?.sabor ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Ex: Cola Zero, Guaraná, Laranja"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Início produção</label>
          <input
            name="dataInicioProducao"
            type="datetime-local"
            required
            lang="pt-BR"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {state.errors?.dataInicioProducao && <p className="mt-1 text-xs text-red-600">{state.errors.dataInicioProducao[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Fim produção <span className="text-slate-400 font-normal">(deixe vazio se em curso)</span>
          </label>
          <input
            name="dataFimProducao"
            type="datetime-local"
            lang="pt-BR"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Volume total</label>
          <input
            name="volumeTotal"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="5000L"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Unidades produzidas</label>
          <input
            name="unidadesProduzidas"
            type="number"
            min={0}
            step={1}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="12000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Linha de produção</label>
          <input
            name="linha"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Linha 1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Turno</label>
          <select
            name="turno"
            defaultValue=""
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">— Selecione —</option>
            <option value="MANHA">Manhã</option>
            <option value="TARDE">Tarde</option>
            <option value="NOITE">Noite</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Responsável de produção</label>
          <input
            name="responsavelProducao"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Nome completo"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Observações</label>
        <textarea
          name="observacoes"
          rows={2}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Anotações da produção…"
        />
      </div>

      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Criar lote"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/lotes")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
