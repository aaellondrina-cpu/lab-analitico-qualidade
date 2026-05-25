"use client";

import { useActionState, useState } from "react";
import { criarRegistroMAPA, type RegistroMAPAFormState } from "../actions";

const SFAS = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA",
  "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
];

const initialState: RegistroMAPAFormState = {};

export function RegistroMAPAForm({ produtos }: { produtos: { id: string; codigo: string; nome: string }[] }) {
  const [state, action, pending] = useActionState(criarRegistroMAPA, initialState);
  const [tipo, setTipo] = useState<"ESTABELECIMENTO" | "PRODUTO">("ESTABELECIMENTO");

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Tipo de registro</label>
        <div className="flex gap-2">
          {(["ESTABELECIMENTO", "PRODUTO"] as const).map((t) => (
            <label
              key={t}
              className={
                "flex-1 rounded-md border px-3 py-2 cursor-pointer text-sm text-center " +
                (tipo === t
                  ? "border-petroleo bg-petroleo/5 text-petroleo font-medium"
                  : "border-slate-200 hover:bg-slate-50")
              }
            >
              <input type="radio" name="tipo" value={t} checked={tipo === t}
                onChange={() => setTipo(t)} className="sr-only" />
              {t === "ESTABELECIMENTO" ? "Estabelecimento" : "Produto"}
            </label>
          ))}
        </div>
      </div>

      {tipo === "PRODUTO" && (
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Produto</label>
          <select name="produtoId" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">Selecione...</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>{p.codigo} — {p.nome}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Número do registro MAPA</label>
        <input name="numero" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="ex: REG-MAPA-12345/2026" />
        {state.errors?.numero && <p className="mt-1 text-xs text-red-600">{state.errors.numero[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Data de concessão</label>
          <input name="dataConcessao" type="date" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Validade</label>
          <input name="validade" type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Nº do processo</label>
          <input name="numeroProcesso" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">SFA responsável (UF)</label>
          <select name="sfaEstado" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="">—</option>
            {SFAS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </div>
      </div>

      {state.message && (
        <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{state.message}</p>
      )}

      <button type="submit" disabled={pending}
        className="w-full rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark disabled:opacity-60">
        {pending ? "Salvando..." : "Salvar registro"}
      </button>
    </form>
  );
}
