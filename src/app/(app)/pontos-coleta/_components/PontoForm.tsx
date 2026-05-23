"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { criarPontoColeta, type PontoFormState } from "../actions";
import { TIPOS_PONTO_COLETA } from "@/lib/constants";

const initialState: PontoFormState = {};

export function PontoForm() {
  const [state, action, pending] = useActionState(criarPontoColeta, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form ref={formRef} action={action} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
      <div className="sm:col-span-1">
        <label className="block text-xs font-medium text-slate-700 mb-1">Nome do ponto</label>
        <input
          name="nome"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Linha 1 - Pós pasteurização"
        />
        {state.errors?.nome && <p className="mt-1 text-xs text-red-600">{state.errors.nome[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
        <select
          name="tipo"
          required
          defaultValue=""
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="" disabled>Selecione…</option>
          {TIPOS_PONTO_COLETA.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {state.errors?.tipo && <p className="mt-1 text-xs text-red-600">{state.errors.tipo[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Localização</label>
        <input
          name="localizacao"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Galpão A, sala 3"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60"
      >
        {pending ? "Adicionando…" : "+ Adicionar"}
      </button>
    </form>
  );
}
