"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { emitirLaudo, type EmitirLaudoState } from "../actions";

const initialState: EmitirLaudoState = {};

export function EmitirLaudoForm({
  amostraId,
  sugestao,
}: {
  amostraId: string;
  sugestao: "APROVADO" | "REPROVADO" | "APROVADO_COM_RESTRICOES";
}) {
  const [state, action, pending] = useActionState(emitirLaudo, initialState);
  const router = useRouter();

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="amostraId" value={amostraId} />

      <div>
        <label className="block text-xs font-medium text-slate-700 mb-2">Conclusão</label>
        <div className="space-y-2">
          {[
            { value: "APROVADO", label: "Aprovado", color: "border-emerald-300 bg-emerald-50" },
            {
              value: "APROVADO_COM_RESTRICOES",
              label: "Aprovado com restrições",
              color: "border-amber-300 bg-amber-50",
            },
            { value: "REPROVADO", label: "Reprovado", color: "border-red-300 bg-red-50" },
          ].map((opt) => (
            <label
              key={opt.value}
              className={
                "flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer text-sm " +
                (sugestao === opt.value ? opt.color : "border-slate-200 hover:bg-slate-50")
              }
            >
              <input
                type="radio"
                name="conclusao"
                value={opt.value}
                defaultChecked={sugestao === opt.value}
                required
              />
              <span>{opt.label}</span>
              {sugestao === opt.value && (
                <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-500">
                  sugerido
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="observacoes" className="block text-xs font-medium text-slate-700 mb-1">
          Observações (opcional)
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
          placeholder="Restrições, recomendações, contexto da análise..."
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
          {pending ? "Emitindo…" : "Emitir laudo"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
