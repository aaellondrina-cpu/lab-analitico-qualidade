"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { criarColaborador, type ColaboradorFormState } from "../actions";

const initialState: ColaboradorFormState = {};

export function ColaboradorForm() {
  const [state, action, pending] = useActionState(criarColaborador, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form ref={formRef} action={action} className="grid grid-cols-1 lg:grid-cols-4 gap-3">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Nome</label>
        <input
          name="nome"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        />
        {state.errors?.nome && <p className="text-xs text-red-600">{state.errors.nome[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Cargo</label>
        <input
          name="cargo"
          required
          placeholder="Analista químico / Operador..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        />
        {state.errors?.cargo && <p className="text-xs text-red-600">{state.errors.cargo[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Setor</label>
        <input
          name="setor"
          required
          placeholder="Laboratório / Produção..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        />
        {state.errors?.setor && <p className="text-xs text-red-600">{state.errors.setor[0]}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
        <input
          name="email"
          type="email"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        />
        {state.errors?.email && <p className="text-xs text-red-600">{state.errors.email[0]}</p>}
      </div>
      <div className="lg:col-span-4 flex justify-end">
        {state.message && (
          <p className="text-xs text-red-700 mr-3 self-center">{state.message}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Adicionar colaborador"}
        </button>
      </div>
    </form>
  );
}
