"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { registrarTreinamento, type TreinamentoFormState } from "../actions";
import { FORMA_TREINAMENTO } from "@/lib/documento-meta";

const initialState: TreinamentoFormState = {};

export function TreinamentoForm({
  colaboradores,
  documentos,
}: {
  colaboradores: { id: string; nome: string; cargo: string }[];
  documentos: { id: string; codigo: string; titulo: string; versao: string }[];
}) {
  const [state, action, pending] = useActionState(registrarTreinamento, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Colaborador</label>
          <select
            name="colaboradorId"
            required
            defaultValue=""
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>Selecione…</option>
            {colaboradores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} ({c.cargo})
              </option>
            ))}
          </select>
          {state.errors?.colaboradorId && <p className="text-xs text-red-600">{state.errors.colaboradorId[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Documento</label>
          <select
            name="documentoId"
            required
            defaultValue=""
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>Selecione…</option>
            {documentos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.codigo} v{d.versao} — {d.titulo}
              </option>
            ))}
          </select>
          {state.errors?.documentoId && <p className="text-xs text-red-600">{state.errors.documentoId[0]}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Data do treinamento</label>
          <input
            name="dataRealizado"
            type="date"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {state.errors?.dataRealizado && <p className="text-xs text-red-600">{state.errors.dataRealizado[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Validade (opcional)</label>
          <input
            name="validade"
            type="date"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Instrutor</label>
          <input
            name="instrutor"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {state.errors?.instrutor && <p className="text-xs text-red-600">{state.errors.instrutor[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Forma</label>
          <select
            name="forma"
            required
            defaultValue="PRESENCIAL"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {FORMA_TREINAMENTO.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">URL da evidência (opcional)</label>
          <input
            name="evidenciaUrl"
            placeholder="Lista de presença, certificado..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Observações</label>
          <input
            name="observacoes"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60"
      >
        {pending ? "Registrando…" : "Registrar treinamento"}
      </button>
    </form>
  );
}
