import { PageHeader } from "@/components/PageHeader";

export default function RelatoriosPage() {
  return (
    <>
      <PageHeader
        title="Relatórios"
        subtitle="Rastreabilidade por lote e boletins de qualidade"
      />

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Rastreabilidade por lote" hint="Todos os resultados de um lote consolidados" />
        <Card title="Boletim mensal" hint="Visão de conformidade do mês" />
        <Card title="Exportar dados" hint="CSV / Excel para auditoria" />
      </section>
    </>
  );
}

function Card({ title, hint }: { title: string; hint: string }) {
  return (
    <button className="text-left rounded-lg border border-slate-200 bg-white p-4 hover:border-agua">
      <h3 className="text-sm font-semibold text-petroleo">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </button>
  );
}
