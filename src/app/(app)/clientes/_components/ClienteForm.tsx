"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { criarCliente, atualizarCliente, type ClienteFormState } from "../actions";
import { MaskedInput } from "@/components/MaskedInput";

const initialState: ClienteFormState = {};

export type ClienteInitial = {
  id: string;
  razaoSocial: string;
  cnpj: string;
  responsavel: string;
  email: string;
  telefone: string;
};

export function ClienteForm({ initial }: { initial?: ClienteInitial }) {
  const isEdit = !!initial;
  const [state, action, pending] = useActionState(
    isEdit ? atualizarCliente : criarCliente,
    initialState,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.push("/clientes");
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form action={action} className="space-y-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <Field
        label="Razão Social"
        name="razaoSocial"
        defaultValue={initial?.razaoSocial}
        errors={state.errors?.razaoSocial}
        required
      />
      <FieldMasked
        label="CNPJ"
        name="cnpj"
        mask="cnpj"
        defaultValue={initial?.cnpj}
        errors={state.errors?.cnpj}
        placeholder="00.000.000/0000-00"
        required
      />
      <Field
        label="Responsável"
        name="responsavel"
        defaultValue={initial?.responsavel}
        errors={state.errors?.responsavel}
        required
      />
      <Field
        label="E-mail"
        name="email"
        type="email"
        defaultValue={initial?.email}
        errors={state.errors?.email}
        required
      />
      <FieldMasked
        label="Telefone"
        name="telefone"
        mask="telefone"
        defaultValue={initial?.telefone}
        errors={state.errors?.telefone}
        placeholder="(11) 99999-9999"
        required
      />

      {/* Comercial */}
      <fieldset className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-3">
        <legend className="px-1 text-[10px] uppercase tracking-wider text-slate-500 font-medium">Comercial</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
            <select name="tipo" defaultValue="" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">—</option>
              <option value="DISTRIBUIDOR">Distribuidor</option>
              <option value="ATACADISTA">Atacadista</option>
              <option value="VAREJISTA">Varejista</option>
              <option value="CONSUMIDOR_FINAL">Consumidor final</option>
              <option value="EXPORTACAO">Exportação</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Condição de pagamento</label>
            <select name="condicaoPagamento" defaultValue="" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">—</option>
              <option value="AVISTA">À vista</option>
              <option value="30">30 dias</option>
              <option value="60">60 dias</option>
              <option value="90">90 dias</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Limite de crédito (R$)" name="limiteCredito" type="number" />
          <Field label="Vendedor responsável" name="vendedorResponsavel" />
        </div>
      </fieldset>

      {/* Contatos múltiplos */}
      <fieldset className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-3">
        <legend className="px-1 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          Contato de qualidade / RT (importante para envio de laudos)
        </legend>
        <Field label="Nome RT" name="contatoRtNome" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="E-mail RT" name="contatoRtEmail" type="email" />
          <Field label="Telefone RT" name="contatoRtTelefone" />
        </div>
        <Field label="E-mail dedicado para laudos" name="contatoLaudoEmail" type="email" placeholder="laudos@cliente.com.br" />
      </fieldset>

      {/* Documentos */}
      <fieldset className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-3">
        <legend className="px-1 text-[10px] uppercase tracking-wider text-slate-500 font-medium">Documentos (URLs)</legend>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Alvará URL" name="alvaraUrl" placeholder="https://..." />
          <Field label="Alvará validade" name="alvaraValidade" type="date" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vig. Sanitária URL" name="vigilanciaUrl" placeholder="https://..." />
          <Field label="Vig. Sanitária validade" name="vigilanciaValidade" type="date" />
        </div>
        <Field label="Contrato URL" name="contratoUrl" placeholder="https://..." />
      </fieldset>

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
          {pending ? "Salvando…" : isEdit ? "Salvar alterações" : "Salvar cliente"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/clientes")}
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
  defaultValue?: string;
};

function Field({ label, name, errors, type = "text", placeholder, required, defaultValue }: FieldProps) {
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
        defaultValue={defaultValue}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
      />
      {errors?.length ? <p className="mt-1 text-xs text-red-600">{errors[0]}</p> : null}
    </div>
  );
}

function FieldMasked({
  label,
  name,
  mask,
  errors,
  placeholder,
  required,
  defaultValue,
}: FieldProps & { mask: "cnpj" | "cpf" | "telefone" | "cep" }) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-slate-700 mb-1">
        {label}
      </label>
      <MaskedInput
        id={name}
        name={name}
        mask={mask}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
      />
      {errors?.length ? <p className="mt-1 text-xs text-red-600">{errors[0]}</p> : null}
    </div>
  );
}
