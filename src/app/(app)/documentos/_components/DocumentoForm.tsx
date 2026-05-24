"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { criarDocumento, type DocumentoFormState } from "../actions";
import { TIPO_DOCUMENTO } from "@/lib/documento-meta";

const initialState: DocumentoFormState = {};

export function DocumentoForm({
  documentosVigentes,
}: {
  documentosVigentes: { id: string; codigo: string; titulo: string; versao: string }[];
}) {
  const [state, action, pending] = useActionState(criarDocumento, initialState);
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
      <div className="grid grid-cols-3 gap-3">
        <Field label="Código" name="codigo" placeholder="POP-LAB-001" errors={state.errors?.codigo} required />
        <Field label="Versão" name="versao" placeholder="1.0" errors={state.errors?.versao} required />
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
          <select
            name="tipo"
            required
            defaultValue=""
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>Selecione…</option>
            {TIPO_DOCUMENTO.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <Field label="Título" name="titulo" placeholder="Procedimento Operacional Padrão para análise de pH" errors={state.errors?.titulo} required />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Aprovado por" name="aprovadoPor" errors={state.errors?.aprovadoPor} required />
        <Field label="Data de aprovação" name="dataAprovacao" type="date" errors={state.errors?.dataAprovacao} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Próxima revisão (opcional)" name="revisaoEm" type="date" errors={state.errors?.revisaoEm} />
        <Field label="URL do arquivo (PDF)" name="arquivoUrl" placeholder="https://..." errors={state.errors?.arquivoUrl} />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Substitui versão anterior (opcional)</label>
        <select name="versaoAnteriorId" defaultValue="" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">— Nenhum (documento novo) —</option>
          {documentosVigentes.map((d) => (
            <option key={d.id} value={d.id}>
              {d.codigo} v{d.versao} — {d.titulo}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-slate-500 mt-1">Se selecionado, a versão anterior será marcada como OBSOLETO.</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Observações</label>
        <textarea
          name="observacoes"
          rows={2}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Cadastrar documento"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  errors,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  errors?: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
      />
      {errors?.length ? <p className="mt-1 text-xs text-red-600">{errors[0]}</p> : null}
    </div>
  );
}
