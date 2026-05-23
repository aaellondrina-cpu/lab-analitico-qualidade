import { PageHeader } from "@/components/PageHeader";

export default function DashboardPage() {
  const cards = [
    { label: "Amostras recebidas hoje", value: "—", hint: "Atualizado em tempo real" },
    { label: "Em análise", value: "—", hint: "Aguardando resultado" },
    { label: "Laudos pendentes", value: "—", hint: "Aguardando aprovação" },
    { label: "NCs abertas", value: "—", hint: "Tratamento em andamento" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Visão operacional do laboratório"
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold text-petroleo">{c.value}</p>
            <p className="mt-1 text-xs text-slate-400">{c.hint}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 h-64">
          <h2 className="text-sm font-semibold text-petroleo">Conformidade por produto (30d)</h2>
          <p className="mt-2 text-xs text-slate-400">Gráfico de barras — pendente integração</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 h-64">
          <h2 className="text-sm font-semibold text-petroleo">Tendência de parâmetros críticos</h2>
          <p className="mt-2 text-xs text-slate-400">Gráfico de linha — pendente integração</p>
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-sm font-semibold text-amber-900">⚠ Alertas</h2>
        <p className="mt-1 text-xs text-amber-800">
          Amostras com prazo vencendo nas próximas 24h e resultados não conformes sem ação corretiva.
        </p>
      </section>
    </>
  );
}
