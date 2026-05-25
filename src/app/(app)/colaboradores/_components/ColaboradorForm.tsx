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
    <form ref={formRef} action={action} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Nome</label>
          <input name="nome" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          {state.errors?.nome && <p className="text-xs text-red-600">{state.errors.nome[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">CPF</label>
          <input name="cpf" placeholder="000.000.000-00" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Data de admissão</label>
          <input name="dataAdmissao" type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Cargo</label>
          <input name="cargo" required placeholder="Analista químico / Operador..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Setor</label>
          <input name="setor" required placeholder="Laboratório / Produção..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Perfil de acesso</label>
          <select name="role" defaultValue="ANALISTA" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="ADMIN">Admin</option>
            <option value="RT">RT (Responsável Técnico)</option>
            <option value="ANALISTA">Analista</option>
            <option value="OPERADOR">Operador</option>
            <option value="LEITURA">Leitura</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
          <input name="email" type="email" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Telefone</label>
          <input name="telefone" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <fieldset className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-3">
        <legend className="px-1 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          Saúde ocupacional (BPF MAPA)
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Próximo exame periódico</label>
            <input name="proximoExame" type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Aptidão</label>
            <select name="aptidao" defaultValue="APTO" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="APTO">Apto</option>
              <option value="APTO_COM_RESTRICOES">Apto com restrições</option>
              <option value="INAPTO">Inapto</option>
            </select>
          </div>
        </div>
      </fieldset>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Equipamentos habilitados (separar com vírgula)
        </label>
        <input name="equipamentos" placeholder="pHmetro, Refratômetro, Carbonatômetro"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
      </div>

      <div className="flex justify-end">
        {state.message && (
          <p className="text-xs text-red-700 mr-3 self-center">{state.message}</p>
        )}
        <button type="submit" disabled={pending}
          className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60">
          {pending ? "Salvando…" : "Adicionar colaborador"}
        </button>
      </div>
    </form>
  );
}
