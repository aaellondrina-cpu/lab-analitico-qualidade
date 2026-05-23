"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { adicionarItem, type ItemFormState } from "../actions";

const initialState: ItemFormState = {};

export function AdicionarItemForm({
  auditoriaId,
  areasSugeridas,
}: {
  auditoriaId: string;
  areasSugeridas: string[];
}) {
  const [state, action, pending] = useActionState(adicionarItem, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form ref={formRef} action={action} className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
      <input type="hidden" name="auditoriaId" value={auditoriaId} />

      <div className="md:col-span-1">
        <label className="block text-xs text-slate-600 mb-0.5">Área</label>
        <input
          name="area"
          list="areas-sugestoes"
          required
          defaultValue={areasSugeridas[0] ?? ""}
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        />
        <datalist id="areas-sugestoes">
          {areasSugeridas.map((a) => (
            <option key={a} value={a} />
          ))}
        </datalist>
      </div>

      <div className="md:col-span-2">
        <label className="block text-xs text-slate-600 mb-0.5">Item verificado</label>
        <input
          name="item"
          required
          placeholder="Ex: Vestimentas dos manipuladores conforme PRT 326"
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        />
        {state.errors?.item?.[0] && (
          <p className="mt-0.5 text-[11px] text-red-600">{state.errors.item[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-xs text-slate-600 mb-0.5">Resultado</label>
        <select
          name="resultado"
          defaultValue="CONFORME"
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        >
          <option value="CONFORME">Conforme</option>
          <option value="NAO_CONFORME">Não conforme</option>
          <option value="NAO_APLICAVEL">N/A</option>
          <option value="OBSERVACAO">Observação</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-600 mb-0.5">Observação / NC ID</label>
        <input
          name="observacao"
          placeholder="Detalhes"
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        />
      </div>

      <div className="md:col-span-5 flex items-center justify-between gap-2 pt-1">
        <div className="text-[11px] text-slate-500">
          Dica: para vincular uma NC existente, edite o item depois informando o ID da NC.
        </div>
        {state.message && (
          <p className="text-[11px] text-red-600">{state.message}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-petroleo px-4 py-1.5 text-xs font-medium text-white hover:bg-petroleo-dark disabled:opacity-60"
        >
          {pending ? "Adicionando…" : "+ Adicionar"}
        </button>
      </div>
    </form>
  );
}
