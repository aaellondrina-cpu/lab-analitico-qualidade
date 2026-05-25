"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { criarEspecInsumo, type EspecInsumoState } from "../actions";

const initialState: EspecInsumoState = {};

export function EspecInsumoForm({ insumoId }: { insumoId: string }) {
  const [state, action, pending] = useActionState(criarEspecInsumo, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form ref={formRef} action={action} className="grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
      <input type="hidden" name="insumoId" value={insumoId} />
      <div className="md:col-span-2">
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Parâmetro</label>
        <input name="parametro" required placeholder="Pureza, pH, Umidade..." className="w-full rounded-md border border-slate-300 px-2 py-2" />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Mín</label>
        <input name="minimo" type="number" step="0.0001" className="w-full rounded-md border border-slate-300 px-2 py-2" />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Máx</label>
        <input name="maximo" type="number" step="0.0001" className="w-full rounded-md border border-slate-300 px-2 py-2" />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Un.</label>
        <input name="unidade" required placeholder="%, g/100g..." className="w-full rounded-md border border-slate-300 px-2 py-2" />
      </div>
      <div>
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">&nbsp;</label>
        <button type="submit" disabled={pending}
          className="w-full rounded-md bg-petroleo px-3 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60">
          {pending ? "..." : "Adicionar"}
        </button>
      </div>
      <div className="md:col-span-3">
        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Método</label>
        <input name="metodo" className="w-full rounded-md border border-slate-300 px-2 py-2" />
      </div>
      <div className="md:col-span-3 flex items-end">
        <label className="text-xs flex items-center gap-2">
          <input type="checkbox" name="obrigatorio" defaultChecked /> Parâmetro obrigatório
        </label>
      </div>
    </form>
  );
}
