"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { criarPCC, type PCCFormState } from "../actions";

const initialState: PCCFormState = {};

const TIPOS = [
  { value: "BIOLOGICO", label: "Biológico" },
  { value: "QUIMICO", label: "Químico" },
  { value: "FISICO", label: "Físico" },
  { value: "RADIOLOGICO", label: "Radiológico" },
];
const NIVEIS = [
  { value: "ALTA", label: "Alta" },
  { value: "MEDIA", label: "Média" },
  { value: "BAIXA", label: "Baixa" },
];

export function PCCForm() {
  const [state, action, pending] = useActionState(criarPCC, initialState);
  const router = useRouter();

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Número do PCC" name="numero" placeholder="PCC-01" errors={state.errors?.numero} required />
        <Field label="Etapa do processo" name="etapa" placeholder="Pasteurização / Envase..." errors={state.errors?.etapa} required />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Perigo identificado</label>
        <textarea
          name="perigo"
          rows={2}
          placeholder="Ex: Sobrevivência de patógenos (Salmonella, E. coli) após tratamento térmico"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        />
        {state.errors?.perigo && <p className="mt-1 text-xs text-red-600">{state.errors.perigo[0]}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Select label="Tipo de perigo" name="tipoPerigo" options={TIPOS} required />
        <Select label="Probabilidade" name="probabilidade" options={NIVEIS} required />
        <Select label="Severidade" name="severidade" options={NIVEIS} required />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Medida de controle</label>
        <textarea
          name="medidaControle"
          rows={2}
          placeholder="Ex: Pasteurização a 75°C por 15 segundos"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        />
        {state.errors?.medidaControle && <p className="mt-1 text-xs text-red-600">{state.errors.medidaControle[0]}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Limite crítico mín." name="limiteCriticoMin" type="number" step="0.01" errors={state.errors?.limiteCriticoMin} />
        <Field label="Limite crítico máx." name="limiteCriticoMax" type="number" step="0.01" errors={state.errors?.limiteCriticoMax} />
        <Field label="Unidade" name="unidade" placeholder="°C / pH / mg/L..." errors={state.errors?.unidade} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Frequência de monitoramento" name="frequencia" placeholder="A cada batelada / horário" errors={state.errors?.frequencia} required />
        <Field label="Responsável" name="responsavel" errors={state.errors?.responsavel} required />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Ação corretiva se limite ultrapassado</label>
        <textarea
          name="acaoCorretiva"
          rows={2}
          placeholder="Ex: Interromper produção, segregar lote, reanalisar..."
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        />
        {state.errors?.acaoCorretiva && <p className="mt-1 text-xs text-red-600">{state.errors.acaoCorretiva[0]}</p>}
      </div>

      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Cadastrar PCC"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/appcc")}
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
  type = "text",
  step,
  placeholder,
  errors,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
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
        step={step}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
      />
      {errors?.length ? <p className="mt-1 text-xs text-red-600">{errors[0]}</p> : null}
    </div>
  );
}

function Select({
  label,
  name,
  options,
  required,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
      >
        <option value="" disabled>
          Selecione…
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
