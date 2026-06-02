"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { criarInsumo, type InsumoFormState } from "../actions";

const initialState: InsumoFormState = {};

const TIPOS = [
  { value: "AGUA", label: "Água de processo" },
  { value: "ACUCAR", label: "Açúcar cristal" },
  { value: "HFCS", label: "HFCS (xarope de milho)" },
  { value: "CO2", label: "CO₂ grau alimentício" },
  { value: "CONCENTRADO", label: "Concentrado" },
  { value: "ESSENCIA", label: "Essência" },
  { value: "EDULCORANTE", label: "Edulcorante" },
  { value: "ACIDULANTE", label: "Acidulante" },
  { value: "CONSERVANTE", label: "Conservante" },
  { value: "CORANTE", label: "Corante" },
  { value: "OUTRO", label: "Outro" },
];

const UNIDADES = [
  { value: "kg", label: "kg" },
  { value: "L", label: "L" },
  { value: "m3", label: "m³" },
  { value: "un", label: "un" },
];

type Fornecedor = { id: string; razaoSocial: string };

export function InsumoForm({ fornecedores }: { fornecedores: Fornecedor[] }) {
  const [state, action, pending] = useActionState(criarInsumo, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.push(state.insumoId ? `/insumos/${state.insumoId}` : "/insumos");
      router.refresh();
    }
  }, [state.ok, state.insumoId, router]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nome" name="nome" errors={state.errors?.nome} required />
        <Field
          label="Código"
          name="codigo"
          errors={state.errors?.codigo}
          placeholder="INS-001"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
        <select
          name="tipo"
          defaultValue="ACUCAR"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        >
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {state.errors?.tipo?.[0] && <p className="mt-1 text-xs text-red-600">{state.errors.tipo[0]}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Fornecedor</label>
        <select
          name="fornecedorId"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        >
          {fornecedores.map((f) => (
            <option key={f.id} value={f.id}>
              {f.razaoSocial}
            </option>
          ))}
        </select>
        {state.errors?.fornecedorId?.[0] && (
          <p className="mt-1 text-xs text-red-600">{state.errors.fornecedorId[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Unidade padrão</label>
        <select
          name="unidadePadrao"
          defaultValue="kg"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        >
          {UNIDADES.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </div>

      <p className="rounded-md border border-agua/30 bg-agua/5 px-3 py-2 text-xs text-slate-600">
        💡 Os valores de custo (preço unitário, NF, condição de pagamento) são
        preenchidos ao registrar o primeiro <strong>lote</strong> do insumo —
        você vai cair direto nessa tela após salvar.
      </p>

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
          {pending ? "Salvando…" : "Salvar insumo"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/insumos")}
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
