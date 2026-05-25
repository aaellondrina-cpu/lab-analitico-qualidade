"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { criarEmbalagem, type EmbalagemFormState } from "../actions";

const initialState: EmbalagemFormState = {};

const TIPOS: { value: string; label: string }[] = [
  { value: "PET", label: "Garrafa PET" },
  { value: "VIDRO_RETORNAVEL", label: "Vidro retornável" },
  { value: "VIDRO_NAO_RETORNAVEL", label: "Vidro não retornável" },
  { value: "LATA", label: "Lata alumínio" },
  { value: "TAMPA", label: "Tampa / Rolha" },
  { value: "ROTULO", label: "Rótulo" },
];

// Quais campos numéricos são relevantes por tipo (UI hint — todos opcionais no backend)
const RELEVANTES: Record<string, string[]> = {
  PET: ["volumeNominalMl", "pesoGramas", "espessuraMm", "resistenciaBar"],
  VIDRO_RETORNAVEL: ["volumeNominalMl", "numeroTrips"],
  VIDRO_NAO_RETORNAVEL: ["volumeNominalMl", "pesoGramas"],
  LATA: ["volumeNominalMl", "pesoGramas"],
  TAMPA: ["torqueNcm"],
  ROTULO: [],
};

export function EmbalagemForm() {
  const [state, action, pending] = useActionState(criarEmbalagem, initialState);
  const [tipo, setTipo] = useState<string>("PET");
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.push("/embalagens");
      router.refresh();
    }
  }, [state.ok, router]);

  const relevantes = new Set(RELEVANTES[tipo] ?? []);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Fornecedor" name="fornecedor" errors={state.errors?.fornecedor} required />
        <Field
          label="Lote do fornecedor"
          name="loteFornecedor"
          errors={state.errors?.loteFornecedor}
          required
        />
      </div>

      <fieldset className="rounded-md border border-slate-200 p-4 space-y-3">
        <legend className="text-xs text-slate-500 px-1">Especificação técnica</legend>
        <div className="grid grid-cols-2 gap-4">
          <NumField
            label="Volume nominal (ml)"
            name="volumeNominalMl"
            errors={state.errors?.volumeNominalMl}
            highlight={relevantes.has("volumeNominalMl")}
          />
          <NumField
            label="Peso (g)"
            name="pesoGramas"
            errors={state.errors?.pesoGramas}
            highlight={relevantes.has("pesoGramas")}
          />
          <NumField
            label="Espessura parede (mm)"
            name="espessuraMm"
            errors={state.errors?.espessuraMm}
            step="0.01"
            highlight={relevantes.has("espessuraMm")}
          />
          <NumField
            label="Resistência (bar)"
            name="resistenciaBar"
            errors={state.errors?.resistenciaBar}
            step="0.1"
            highlight={relevantes.has("resistenciaBar")}
          />
          <NumField
            label="Torque (N·cm)"
            name="torqueNcm"
            errors={state.errors?.torqueNcm}
            step="0.1"
            highlight={relevantes.has("torqueNcm")}
          />
          <NumField
            label="Nº de trips (vidro retornável)"
            name="numeroTrips"
            errors={state.errors?.numeroTrips}
            step="1"
            highlight={relevantes.has("numeroTrips")}
          />
        </div>
      </fieldset>

      {/* Custos */}
      <fieldset className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-3">
        <legend className="px-1 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          Custo (opcional)
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <NumField label="Preço unitário (R$)" name="precoUnitario" step="0.0001" />
          <NumField label="Quantidade recebida" name="quantidadeRecebida" step="0.01" />
        </div>
        <Field label="Nº da NF" name="numeroNF" placeholder="NF-12345" />
        <p className="text-[10px] text-slate-500">
          Valor total será calculado automaticamente (preço × quantidade recebida).
        </p>
      </fieldset>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Status inicial</label>
        <select
          name="status"
          defaultValue="EM_ANALISE"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        >
          <option value="EM_ANALISE">Em análise</option>
          <option value="APROVADA">Aprovada</option>
          <option value="REPROVADA">Reprovada</option>
          <option value="DESCARTE">Descarte</option>
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
          {pending ? "Salvando…" : "Registrar embalagem"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/embalagens")}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  errors?: string[];
  type?: string;
  placeholder?: string;
  required?: boolean;
};

function Field({ label, name, errors, type = "text", placeholder, required }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-slate-700 mb-1">
        {label}
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

type NumFieldProps = {
  label: string;
  name: string;
  errors?: string[];
  step?: string;
  highlight?: boolean;
};

function NumField({ label, name, errors, step = "0.01", highlight }: NumFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className={
          "block text-xs font-medium mb-1 " +
          (highlight ? "text-petroleo" : "text-slate-500")
        }
      >
        {label} {highlight && <span className="text-[10px] text-agua">• comum p/ este tipo</span>}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        step={step}
        min={0}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
      />
      {errors?.length ? <p className="mt-1 text-xs text-red-600">{errors[0]}</p> : null}
    </div>
  );
}
