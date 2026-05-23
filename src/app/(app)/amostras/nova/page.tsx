import { PageHeader } from "@/components/PageHeader";

export default function NovaAmostraPage() {
  return (
    <>
      <PageHeader
        title="Nova amostra"
        subtitle="Registrar entrada de amostra no laboratório"
      />

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        <Field label="Cliente" placeholder="Selecionar cliente" />
        <Field label="Produto" placeholder="Selecionar produto" />
        <Field label="Lote de produção" placeholder="Ex: L20260523" />
        <Field label="Ponto de coleta" placeholder="Ex: Linha 1 - Pós pasteurização" />
        <Field label="Tipo de análise" placeholder="Rotina | Retenção | Reprocesso..." />
        <Field label="Data/hora de coleta" type="datetime-local" />
        <Field label="Prazo de entrega" type="datetime-local" />
        <Field label="Volume / quantidade" placeholder="Ex: 500mL × 3" />

        <div className="md:col-span-2 flex gap-2 pt-2">
          <button
            type="submit"
            className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark"
          >
            Registrar amostra
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
      />
    </div>
  );
}
