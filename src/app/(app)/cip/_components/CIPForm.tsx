"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { criarRegistroCIP, type CIPFormState } from "../actions";

const initialState: CIPFormState = {};

type AmostraOption = { id: string; numeroOS: string; tipoAnalise: string };

export function CIPForm({ amostras }: { amostras: AmostraOption[] }) {
  const [state, action, pending] = useActionState(criarRegistroCIP, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.push("/cip");
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form action={action} className="space-y-4">
      <Field
        label="Alvo"
        name="alvo"
        errors={state.errors?.alvo}
        placeholder="Tanque Xarope Simples / Linha 1 / Enchedora..."
        required
      />
      <Field label="Responsável" name="responsavel" errors={state.errors?.responsavel} required />

      <div className="grid grid-cols-3 gap-3">
        <Field
          label="Concentração (%)"
          name="concentracao"
          type="number"
          step="0.01"
          errors={state.errors?.concentracao}
          required
        />
        <Field
          label="Temperatura (°C)"
          name="temperatura"
          type="number"
          step="0.1"
          errors={state.errors?.temperatura}
          required
        />
        <Field
          label="Tempo (min)"
          name="tempoContatoMin"
          type="number"
          step="1"
          errors={state.errors?.tempoContatoMin}
          required
        />
      </div>

      <div>
        <label htmlFor="amostraId" className="block text-xs font-medium text-slate-700 mb-1">
          Amostra microbiológica vinculada (opcional)
        </label>
        <select
          id="amostraId"
          name="amostraId"
          defaultValue=""
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        >
          <option value="">— Nenhuma —</option>
          {amostras.map((a) => (
            <option key={a.id} value={a.id}>
              {a.numeroOS} ({a.tipoAnalise})
            </option>
          ))}
        </select>
      </div>

      <Field
        label="Resultado microbiológico (resumo)"
        name="resultadoMicro"
        errors={state.errors?.resultadoMicro}
        placeholder="Ex: Bactérias < 10 UFC/cm² — OK"
      />

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
        <select
          name="status"
          defaultValue="APROVADO"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        >
          <option value="APROVADO">Aprovado</option>
          <option value="REPROCESSAR">Reprocessar</option>
        </select>
      </div>

      <div>
        <label htmlFor="observacoes" className="block text-xs font-medium text-slate-700 mb-1">
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={2}
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
          {pending ? "Salvando…" : "Registrar CIP"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/cip")}
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
  step,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  errors?: string[];
  type?: string;
  step?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
      />
      {errors?.length ? <p className="mt-1 text-xs text-red-600">{errors[0]}</p> : null}
    </div>
  );
}
