"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { criarProduto, type ProdutoFormState } from "../actions";
import { TIPOS_PRODUTO } from "@/lib/constants";
import { TEMPLATES, getTemplate } from "@/lib/templates-especificacoes";

type EspecTipo = "FISICOQUIMICO" | "MICROBIOLOGICO" | "SENSORIAL";

type Espec = {
  parametro: string;
  tipo: EspecTipo;
  minimo: string;
  maximo: string;
  unidade: string;
  metodo: string;
  legislacao: string;
};

const emptyEspec: Espec = {
  parametro: "",
  tipo: "FISICOQUIMICO",
  minimo: "",
  maximo: "",
  unidade: "",
  metodo: "",
  legislacao: "",
};

const TIPO_LABEL: Record<EspecTipo, string> = {
  FISICOQUIMICO: "Físico-químico",
  MICROBIOLOGICO: "Microbiológico",
  SENSORIAL: "Sensorial",
};

const TIPO_CLASS: Record<EspecTipo, string> = {
  FISICOQUIMICO: "bg-cyan-50 text-cyan-700 border-cyan-200",
  MICROBIOLOGICO: "bg-violet-50 text-violet-700 border-violet-200",
  SENSORIAL: "bg-amber-50 text-amber-700 border-amber-200",
};

const initialState: ProdutoFormState = {};

export function ProdutoForm() {
  const [state, action, pending] = useActionState(criarProduto, initialState);
  const [especs, setEspecs] = useState<Espec[]>([{ ...emptyEspec }]);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.push("/produtos");
      router.refresh();
    }
  }, [state.ok, router]);

  function updateEspec(i: number, key: keyof Espec, value: string) {
    setEspecs((prev) => prev.map((e, idx) => (idx === i ? { ...e, [key]: value } : e)));
  }

  function addEspec() {
    setEspecs((prev) => [...prev, { ...emptyEspec }]);
  }

  function removeEspec(i: number) {
    setEspecs((prev) => prev.filter((_, idx) => idx !== i));
  }

  function aplicarTemplate(id: string) {
    const t = getTemplate(id);
    if (!t) return;
    setEspecs((prev) => {
      // Mantém os que já têm parâmetro digitado, adiciona os do template
      const validos = prev.filter((p) => p.parametro.trim() !== "");
      return [...validos, ...t.itens.map((it) => ({ ...it }))];
    });
  }

  function limparTudo() {
    if (!confirm("Limpar todos os parâmetros?")) return;
    setEspecs([{ ...emptyEspec }]);
  }

  return (
    <form action={action} className="space-y-6">
      <input
        type="hidden"
        name="especificacoes"
        value={JSON.stringify(especs.filter((e) => e.parametro.trim() !== ""))}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">Nome do produto</label>
          <input
            name="nome"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
            placeholder="Ex: Refrigerante 2L"
          />
          {state.errors?.nome && <p className="mt-1 text-xs text-red-600">{state.errors.nome[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Código</label>
          <input
            name="codigo"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-agua"
            placeholder="REF-001"
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
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
            defaultValue=""
          >
            <option value="" disabled>Selecione…</option>
            {TIPOS_PRODUTO.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {state.errors?.tipo && <p className="mt-1 text-xs text-red-600">{state.errors.tipo[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Sabor <span className="text-slate-400 font-normal">(opcional — refrigerantes)</span>
          </label>
          <input
            name="sabor"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
            placeholder="Cola, Guaraná, Laranja, Limão…"
          />
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-petroleo">Especificações técnicas</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={limparTudo}
              className="text-xs text-slate-500 hover:text-red-600 hover:underline"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={addEspec}
              className="text-xs text-agua hover:underline"
            >
              + Adicionar parâmetro
            </button>
          </div>
        </div>

        {/* Templates prontos */}
        <div className="rounded-md border border-agua/30 bg-agua/5 p-3 mb-4">
          <div className="text-xs font-medium text-petroleo mb-2">
            Aplicar template pronto (físico-químico + microbiológico já preenchidos):
          </div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => aplicarTemplate(t.id)}
                title={t.descricao}
                className="rounded-md border border-agua bg-white px-3 py-1.5 text-xs text-petroleo hover:bg-agua/10"
              >
                + {t.nome}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Templates adicionam parâmetros aos já cadastrados. Você pode editar valores depois.
          </p>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Resultados fora destes limites geram não conformidade automática.
        </p>

        <div className="space-y-3">
          {especs.map((e, i) => (
            <div key={i} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12 sm:col-span-3">
                  <label className="block text-[11px] text-slate-600 mb-1">Parâmetro</label>
                  <input
                    value={e.parametro}
                    onChange={(ev) => updateEspec(i, "parametro", ev.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                    placeholder="pH"
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <label className="block text-[11px] text-slate-600 mb-1">Tipo</label>
                  <select
                    value={e.tipo}
                    onChange={(ev) => updateEspec(i, "tipo", ev.target.value)}
                    className={
                      "w-full rounded-md border px-2 py-1.5 text-xs " + TIPO_CLASS[e.tipo]
                    }
                  >
                    <option value="FISICOQUIMICO">{TIPO_LABEL.FISICOQUIMICO}</option>
                    <option value="MICROBIOLOGICO">{TIPO_LABEL.MICROBIOLOGICO}</option>
                    <option value="SENSORIAL">{TIPO_LABEL.SENSORIAL}</option>
                  </select>
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-[11px] text-slate-600 mb-1">Mín.</label>
                  <input
                    type="number"
                    step="any"
                    value={e.minimo}
                    onChange={(ev) => updateEspec(i, "minimo", ev.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                  />
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-[11px] text-slate-600 mb-1">Máx.</label>
                  <input
                    type="number"
                    step="any"
                    value={e.maximo}
                    onChange={(ev) => updateEspec(i, "maximo", ev.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <label className="block text-[11px] text-slate-600 mb-1">Unidade</label>
                  <input
                    value={e.unidade}
                    onChange={(ev) => updateEspec(i, "unidade", ev.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                    placeholder="°Brix"
                  />
                </div>
                <div className="col-span-6 sm:col-span-2">
                  <label className="block text-[11px] text-slate-600 mb-1">Método</label>
                  <input
                    value={e.metodo}
                    onChange={(ev) => updateEspec(i, "metodo", ev.target.value)}
                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                    placeholder="AOAC 970.21"
                  />
                </div>
                <div className="col-span-12 sm:col-span-1 flex items-end justify-end">
                  {especs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEspec(i)}
                      className="text-xs text-red-600 hover:underline pb-1.5"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-[11px] text-slate-600 mb-1">Legislação de referência</label>
                <input
                  value={e.legislacao}
                  onChange={(ev) => updateEspec(i, "legislacao", ev.target.value)}
                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                  placeholder="RDC 331/2019"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

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
          {pending ? "Salvando…" : "Salvar produto"}
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
