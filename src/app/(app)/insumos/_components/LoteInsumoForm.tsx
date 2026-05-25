"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { criarLoteInsumo, type LoteInsumoFormState } from "../actions";

const initialState: LoteInsumoFormState = {};

const UNIDADES = ["kg", "L", "m3", "un"];

export function LoteInsumoForm({
  insumoId,
  unidadePadrao,
}: {
  insumoId: string;
  unidadePadrao: string;
}) {
  const [state, action, pending] = useActionState(criarLoteInsumo, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form ref={formRef} action={action} className="space-y-3 text-sm">
      <input type="hidden" name="insumoId" value={insumoId} />

      <Field
        label="Lote do fornecedor"
        name="loteFornecedor"
        errors={state.errors?.loteFornecedor}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Fabricação"
          name="dataFabricacao"
          type="date"
          errors={state.errors?.dataFabricacao}
          required
        />
        <Field
          label="Validade"
          name="dataValidade"
          type="date"
          errors={state.errors?.dataValidade}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Quantidade"
          name="quantidade"
          type="number"
          step="0.001"
          errors={state.errors?.quantidade}
          required
        />
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Unidade</label>
          <select
            name="unidade"
            defaultValue={unidadePadrao}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
          >
            {UNIDADES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Field
        label="URL do certificado (CoA)"
        name="certificadoUrl"
        errors={state.errors?.certificadoUrl}
        placeholder="https://…"
      />

      {/* Custos */}
      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-3">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          Custo do lote (opcional)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Preço unitário (R$)"
            name="precoUnitario"
            type="number"
            step="0.0001"
            placeholder="0,00"
            errors={state.errors?.precoUnitario}
          />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Cond. pagamento</label>
            <select
              name="condicaoPagamento"
              defaultValue=""
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
            >
              <option value="">—</option>
              <option value="AVISTA">À vista</option>
              <option value="30">30 dias</option>
              <option value="60">60 dias</option>
              <option value="90">90 dias</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Nº da NF"
            name="numeroNF"
            placeholder="NF-12345"
            errors={state.errors?.numeroNF}
          />
          <Field
            label="Data da NF"
            name="dataNF"
            type="date"
            errors={state.errors?.dataNF}
          />
        </div>
        <p className="text-[10px] text-slate-500">
          Valor total será calculado automaticamente (preço × quantidade).
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Status inicial</label>
        <select
          name="status"
          defaultValue="EM_ANALISE"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        >
          <option value="EM_ANALISE">Em análise</option>
          <option value="APROVADO">Aprovado</option>
          <option value="REPROVADO">Reprovado</option>
          <option value="QUARENTENA">Quarentena</option>
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

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-petroleo px-3 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Registrar lote"}
      </button>
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
