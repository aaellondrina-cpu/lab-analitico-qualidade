"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { criarEquipamento, type EquipamentoFormState } from "../actions";

const initialState: EquipamentoFormState = {};

export function EquipamentoForm() {
  const [state, action, pending] = useActionState(criarEquipamento, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form ref={formRef} action={action} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div className="lg:col-span-2">
        <label className="block text-xs font-medium text-slate-700 mb-1">Nome</label>
        <input name="nome" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="pHmetro de bancada" />
        {state.errors?.nome && <p className="mt-1 text-xs text-red-600">{state.errors.nome[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Modelo</label>
        <input name="modelo" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="PHS-3E" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Nº de série</label>
        <input name="numeroSerie" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Fabricante</label>
        <input name="fabricante" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Última calibração</label>
        <input name="ultimaCalibracao" type="date" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Próxima calibração</label>
        <input name="proximaCalibracao" type="date" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        {state.errors?.proximaCalibracao && <p className="mt-1 text-xs text-red-600">{state.errors.proximaCalibracao[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">URL Certificado (opcional)</label>
        <input name="certificadoUrl" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="https://…" />
      </div>

      {state.message && (
        <div className="sm:col-span-2 lg:col-span-3">
          <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
        </div>
      )}

      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
        <button type="submit" disabled={pending} className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60">
          {pending ? "Salvando…" : "+ Adicionar equipamento"}
        </button>
      </div>
    </form>
  );
}
