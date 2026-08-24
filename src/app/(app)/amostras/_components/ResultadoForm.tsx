"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { lancarResultado, type ResultadoFormState } from "../actions";

type Espec = { parametro: string; unidade: string; metodo: string | null; minimo: number | null; maximo: number | null };
type Equipamento = { id: string; nome: string; status: string };

const initialState: ResultadoFormState = {};

// Testes padrão comuns (água, bebidas, etc.)
const TESTES_PADRAO = [
  { parametro: "pH", unidade: "", metodo: "SMEWW 4500-H+ B" },
  { parametro: "DBO5", unidade: "mg/L O2", metodo: "SMEWW 5210 B" },
  { parametro: "Temperatura", unidade: "°C", metodo: "SMEWW 2550 B" },
  { parametro: "Cor", unidade: "uH", metodo: "SMEWW 2120 B" },
  { parametro: "Turbidez", unidade: "NTU", metodo: "SMEWW 2130 B" },
  { parametro: "Alcalinidade", unidade: "mg/L CaCO3", metodo: "SMEWW 2320 B" },
  { parametro: "Dureza total", unidade: "mg/L CaCO3", metodo: "SMEWW 2340 C" },
  { parametro: "Cloro residual", unidade: "mg/L", metodo: "SMEWW 4500-Cl G" },
  { parametro: "Ferro", unidade: "mg/L", metodo: "SMEWW 3111 B" },
  { parametro: "Acidez", unidade: "mg/L CaCO3", metodo: "SMEWW 2310 B" },
];

export function ResultadoForm({
  amostraId,
  especificacoes,
  equipamentos,
  defaultAnalista,
}: {
  amostraId: string;
  especificacoes: Espec[];
  equipamentos: Equipamento[];
  defaultAnalista: string;
}) {
  const boundAction = lancarResultado.bind(null, amostraId);
  const [state, action, pending] = useActionState(boundAction, initialState);
  const [parametro, setParametro] = useState("");
  const [usarPadrao, setUsarPadrao] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const espec = especificacoes.find((e) => e.parametro === parametro);
  const testePadrao = TESTES_PADRAO.find((t) => t.parametro === parametro);
  const temEspecificacao = !!espec;

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setParametro("");
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={usarPadrao}
            onChange={(e) => {
              setUsarPadrao(e.target.checked);
              setParametro("");
            }}
            className="rounded"
          />
          Usar testes padrão
        </label>
        {especificacoes.length === 0 && (
          <span className="text-[11px] text-amber-600 ml-auto">ℹ Produto sem especificações cadastradas</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Parâmetro {!temEspecificacao && !usarPadrao && <span className="text-amber-600">*</span>}
          </label>
          {usarPadrao ? (
            <select
              name="parametro"
              value={parametro}
              onChange={(e) => setParametro(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Selecione um teste padrão</option>
              {TESTES_PADRAO.map((t) => (
                <option key={t.parametro} value={t.parametro}>
                  {t.parametro}
                </option>
              ))}
            </select>
          ) : (
            <>
              <input
                name="parametro"
                list="params-list"
                value={parametro}
                onChange={(e) => setParametro(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="Ex: pH, Brix (livre ou da especificação)"
              />
              <datalist id="params-list">
                {especificacoes.map((e) => <option key={e.parametro} value={e.parametro} />)}
              </datalist>
            </>
          )}
          {state.errors?.parametro && <p className="mt-1 text-xs text-red-600">{state.errors.parametro[0]}</p>}
          {espec && (
            <p className="mt-1 text-[11px] bg-emerald-50 border border-emerald-200 rounded px-2 py-1 text-emerald-700">
              ✓ Especificado: {espec.minimo ?? "—"} ↔ {espec.maximo ?? "—"} {espec.unidade}{espec.metodo ? ` · ${espec.metodo}` : ""}
            </p>
          )}
          {!espec && parametro && (
            <p className="mt-1 text-[11px] bg-amber-50 border border-amber-200 rounded px-2 py-1 text-amber-700">
              ⚠ Sem especificação — conformidade não será avaliada
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Valor</label>
            <input
              name="valor"
              type="text"
              inputMode="decimal"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="3.5"
            />
            {state.errors?.valor && <p className="mt-1 text-xs text-red-600">{state.errors.valor[0]}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Unidade</label>
            <input
              name="unidade"
              required
              defaultValue={
                usarPadrao && testePadrao
                  ? testePadrao.unidade
                  : espec?.unidade ?? ""
              }
              key={
                usarPadrao && testePadrao
                  ? testePadrao.unidade
                  : espec?.unidade ?? ""
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="°Brix"
            />
            {state.errors?.unidade && <p className="mt-1 text-xs text-red-600">{state.errors.unidade[0]}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Método</label>
          <input
            name="metodo"
            defaultValue={
              usarPadrao && testePadrao
                ? testePadrao.metodo
                : espec?.metodo ?? ""
            }
            key={`metodo-${
              usarPadrao && testePadrao
                ? testePadrao.metodo
                : espec?.metodo ?? ""
            }`}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="AOAC 970.21"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Analista</label>
          <input
            name="analista"
            defaultValue={defaultAnalista}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {state.errors?.analista && <p className="mt-1 text-xs text-red-600">{state.errors.analista[0]}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Equipamento</label>
          <select name="equipamentoId" defaultValue="" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">— Não informado —</option>
            {equipamentos.map((e) => (
              <option key={e.id} value={e.id} disabled={e.status === "VENCIDO"}>
                {e.nome} {e.status === "VENCIDO" ? "(calibração vencida)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.warning && (
        <p className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">⚠ {state.warning}</p>
      )}
      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60"
      >
        {pending ? "Lançando…" : "Lançar resultado"}
      </button>
    </form>
  );
}
