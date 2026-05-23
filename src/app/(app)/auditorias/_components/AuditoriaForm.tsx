"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { criarAuditoria, type AuditoriaFormState } from "../actions";

const initialState: AuditoriaFormState = {};

const AREAS_PADRAO = [
  "Higiene e sanitização",
  "Controle de pragas",
  "Rastreabilidade",
  "Calibração de equipamentos",
  "Documentação e registros",
  "Treinamento de pessoal",
  "Condições das instalações",
];

const NORMAS = [
  { value: "BPF", label: "BPF — Boas Práticas de Fabricação" },
  { value: "ISO_22000", label: "ISO 22000" },
  { value: "FSSC_22000", label: "FSSC 22000" },
  { value: "ISO_17025", label: "ISO/IEC 17025" },
  { value: "ANVISA", label: "ANVISA" },
  { value: "MAPA", label: "MAPA" },
  { value: "INTERNA", label: "Auditoria interna" },
];

const ORGAOS = [
  { value: "ANVISA", label: "ANVISA" },
  { value: "MAPA", label: "MAPA" },
  { value: "INMETRO", label: "INMETRO / CGCRE" },
  { value: "VIG_SANITARIA", label: "Vigilância Sanitária" },
  { value: "CLIENTE", label: "Cliente / Auditor cliente" },
  { value: "CERTIFICADORA", label: "Certificadora" },
];

export function AuditoriaForm() {
  const [state, action, pending] = useActionState(criarAuditoria, initialState);
  const [tipo, setTipo] = useState<"INTERNA" | "EXTERNA">("INTERNA");
  const router = useRouter();

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
        <div className="flex gap-2">
          {(["INTERNA", "EXTERNA"] as const).map((t) => (
            <label
              key={t}
              className={
                "flex-1 rounded-md border px-3 py-2 cursor-pointer text-sm text-center " +
                (tipo === t
                  ? "border-petroleo bg-petroleo/5 text-petroleo font-medium"
                  : "border-slate-200 hover:bg-slate-50")
              }
            >
              <input
                type="radio"
                name="tipo"
                value={t}
                checked={tipo === t}
                onChange={() => setTipo(t)}
                className="sr-only"
              />
              {t === "INTERNA" ? "Interna" : "Externa"}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Norma / referencial</label>
        <select
          name="norma"
          defaultValue="BPF"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        >
          {NORMAS.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label}
            </option>
          ))}
        </select>
      </div>

      {tipo === "EXTERNA" && (
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Órgão auditor</label>
          <select
            name="orgao"
            defaultValue="ANVISA"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
          >
            {ORGAOS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {state.errors?.orgao?.[0] && (
            <p className="mt-1 text-xs text-red-600">{state.errors.orgao[0]}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Nome do auditor" name="auditorNome" errors={state.errors?.auditorNome} required />
        <Field label="Credencial / registro" name="auditorCredencial" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Data início" name="dataInicio" type="date" errors={state.errors?.dataInicio} required />
        <Field label="Data fim (previsão)" name="dataFim" type="date" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-2">Áreas auditadas</label>
        <div className="space-y-1">
          {AREAS_PADRAO.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="areas" value={a} />
              {a}
            </label>
          ))}
        </div>
      </div>

      {tipo === "EXTERNA" && (
        <>
          <Field label="URL do relatório oficial (PDF)" name="relatorioUrl" placeholder="https://..." />
          <Field label="Prazo de resposta às NCs" name="prazoResposta" type="date" />
        </>
      )}

      <div>
        <label htmlFor="observacoes" className="block text-xs font-medium text-slate-700 mb-1">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
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
          {pending ? "Criando…" : "Criar auditoria"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/auditorias")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  errors,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  errors?: string[];
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
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
