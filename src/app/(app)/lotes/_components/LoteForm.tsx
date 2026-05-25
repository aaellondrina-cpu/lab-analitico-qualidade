"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { criarLote, atualizarLote, type LoteFormState } from "../actions";

type ProdutoLite = { id: string; nome: string; codigo: string; sabor: string | null };

const initialState: LoteFormState = {};

export type LoteInitial = {
  id: string;
  numero: string;
  produtoId: string;
  sabor: string | null;
  dataInicioProducao: Date;
  dataFimProducao: Date | null;
  volumeTotal: string | null;
  unidadesProduzidas: number | null;
  linha: string | null;
  turno: string | null;
  responsavelProducao: string | null;
  observacoes: string | null;
};

function toLocalDateTime(d: Date | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  // YYYY-MM-DDTHH:mm (formato aceito por datetime-local)
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function LoteForm({
  produtos,
  initial,
}: {
  produtos: ProdutoLite[];
  initial?: LoteInitial;
}) {
  const isEdit = !!initial;
  const [state, action, pending] = useActionState(
    isEdit ? atualizarLote : criarLote,
    initialState,
  );
  const [produtoId, setProdutoId] = useState(initial?.produtoId ?? "");
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
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Número do lote {!initial && <span className="text-slate-400">(deixe vazio p/ gerar automático)</span>}
          </label>
          <input
            name="numero"
            defaultValue={initial?.numero}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono uppercase"
            placeholder={initial ? "" : "Auto: 2026-0042-REFGUA-2L-L1"}
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
            <option value="" disabled>
              Selecione…
            </option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.codigo} — {p.nome}
                {p.sabor ? ` (${p.sabor})` : ""}
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
          defaultValue={initial?.sabor ?? produtoSelecionado?.sabor ?? ""}
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
            defaultValue={toLocalDateTime(initial?.dataInicioProducao)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {state.errors?.dataInicioProducao && (
            <p className="mt-1 text-xs text-red-600">{state.errors.dataInicioProducao[0]}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Fim produção <span className="text-slate-400 font-normal">(vazio = em curso)</span>
          </label>
          <input
            name="dataFimProducao"
            type="datetime-local"
            lang="pt-BR"
            defaultValue={toLocalDateTime(initial?.dataFimProducao)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Volume total</label>
          <input
            name="volumeTotal"
            defaultValue={initial?.volumeTotal ?? ""}
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
            defaultValue={initial?.unidadesProduzidas ?? ""}
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
            defaultValue={initial?.linha ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="Linha 1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Turno</label>
          <select
            name="turno"
            defaultValue={initial?.turno ?? ""}
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
            defaultValue={initial?.responsavelProducao ?? ""}
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
          defaultValue={initial?.observacoes ?? ""}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Anotações da produção…"
        />
      </div>

      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {state.message}
        </p>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60"
        >
          {pending ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar lote"}
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
