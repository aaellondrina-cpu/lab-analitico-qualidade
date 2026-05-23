"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { criarFornecedor, type FornecedorFormState } from "../actions";

const initialState: FornecedorFormState = {};

export function FornecedorForm() {
  const [state, action, pending] = useActionState(criarFornecedor, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.push("/fornecedores");
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form action={action} className="space-y-4">
      <Field label="Razão Social" name="razaoSocial" errors={state.errors?.razaoSocial} required />
      <Field label="CNPJ" name="cnpj" errors={state.errors?.cnpj} placeholder="00.000.000/0000-00" required />
      <Field label="Responsável" name="responsavel" errors={state.errors?.responsavel} required />
      <Field label="E-mail" name="email" type="email" errors={state.errors?.email} required />
      <Field label="Telefone" name="telefone" errors={state.errors?.telefone} placeholder="(11) 99999-9999" required />
      <Field label="Endereço" name="endereco" errors={state.errors?.endereco} />
      <Field
        label="Certificações"
        name="certificacoes"
        errors={state.errors?.certificacoes}
        placeholder="Ex: ISO 22000, FSSC 22000, BPF"
      />

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
          {pending ? "Salvando…" : "Salvar fornecedor"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/fornecedores")}
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
