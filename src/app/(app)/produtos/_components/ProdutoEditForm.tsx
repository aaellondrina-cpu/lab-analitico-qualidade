"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { atualizarProduto, type ProdutoFormState } from "../actions";
import { TIPOS_PRODUTO } from "@/lib/constants";

const initialState: ProdutoFormState = {};

export type ProdutoInitial = {
  id: string;
  nome: string;
  codigo: string;
  tipo: string;
  sabor: string | null;
};

export function ProdutoEditForm({ initial }: { initial: ProdutoInitial }) {
  const [state, action, pending] = useActionState(atualizarProduto, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.push("/produtos");
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={initial.id} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Nome do produto</label>
          <input
            name="nome"
            required
            defaultValue={initial.nome}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
          />
          {state.errors?.nome && <p className="mt-1 text-xs text-red-600">{state.errors.nome[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Código</label>
          <input
            name="codigo"
            required
            defaultValue={initial.codigo}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-agua"
          />
          {state.errors?.codigo && <p className="mt-1 text-xs text-red-600">{state.errors.codigo[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
          <select
            name="tipo"
            required
            defaultValue={initial.tipo}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
          >
            {TIPOS_PRODUTO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Sabor</label>
          <input
            name="sabor"
            defaultValue={initial.sabor ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
          />
        </div>
      </div>

      <p className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
        💡 Para alterar especificações técnicas (parâmetros / limites), exclua e
        recadastre o produto. Edição de especificações virá em breve.
      </p>

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
          {pending ? "Salvando…" : "Salvar alterações"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/produtos")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
