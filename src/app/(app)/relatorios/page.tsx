import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

function fmtPct(n: number, total: number) {
  if (total === 0) return "—";
  return `${((n / total) * 100).toFixed(1)}%`;
}

export default async function RelatoriosPage() {
  await requireUser();

  const inicio = new Date();
  inicio.setDate(1);
  inicio.setHours(0, 0, 0, 0);

  const lotesMes = await prisma.lote.findMany({
    where: { createdAt: { gte: inicio } },
    select: { status: true, produto: { select: { nome: true } } },
  });

  const totalMes = lotesMes.length;
  const aprovadosMes = lotesMes.filter(
    (l) => l.status === "APROVADO" || l.status === "LIBERADO" || l.status === "EXPEDIDO",
  ).length;
  const reprovadosMes = lotesMes.filter(
    (l) => l.status === "REPROVADO" || l.status === "RETIDO" || l.status === "DESCARTADO",
  ).length;

  const porProduto = new Map<string, { total: number; aprovados: number }>();
  for (const l of lotesMes) {
    const k = l.produto.nome;
    const cur = porProduto.get(k) ?? { total: 0, aprovados: 0 };
    cur.total += 1;
    if (l.status === "APROVADO" || l.status === "LIBERADO" || l.status === "EXPEDIDO") {
      cur.aprovados += 1;
    }
    porProduto.set(k, cur);
  }

  const ncsAbertas = await prisma.naoConformidade.count({ where: { status: "ABERTA" } });
  const laudosMes = await prisma.laudo.count({ where: { dataEmissao: { gte: inicio } } });

  return (
    <>
      <PageHeader
        title="Relatórios"
        subtitle={`Boletim de qualidade · ${inicio.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`}
      />

      {/* Cards de navegação */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <NavCard
          href="/relatorios/rastreabilidade"
          title="Rastreabilidade por lote"
          hint="Todos os insumos, análises, NCs e laudo de um lote consolidados"
        />
        <NavCard
          href="#boletim"
          title="Boletim do mês"
          hint={`${totalMes} lote(s) · ${fmtPct(aprovadosMes, totalMes)} aprovação`}
        />
        <NavCard
          href="/api/relatorios/amostras.csv"
          title="Exportar amostras (CSV)"
          hint="Todas as OS com resultados e conformidade"
          external
        />
      </section>

      {/* Boletim mensal */}
      <section id="boletim" className="space-y-4">
        <h2 className="text-sm font-semibold text-petroleo">Boletim mensal</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Lotes no mês" value={totalMes} />
          <Stat label="Aprovados" value={aprovadosMes} sub={fmtPct(aprovadosMes, totalMes)} tone="ok" />
          <Stat label="Reprovados / retidos" value={reprovadosMes} sub={fmtPct(reprovadosMes, totalMes)} tone="bad" />
          <Stat label="NCs em aberto" value={ncsAbertas} tone={ncsAbertas > 0 ? "warn" : undefined} />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <header className="bg-slate-50 px-4 py-3 text-xs uppercase tracking-wide text-slate-500">
            Aprovação por produto — mês corrente
          </header>
          {porProduto.size === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-400 text-center">Sem lotes no mês.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left">Produto</th>
                  <th className="px-4 py-2 text-right">Lotes</th>
                  <th className="px-4 py-2 text-right">Aprovados</th>
                  <th className="px-4 py-2 text-right">% Aprovação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...porProduto.entries()].map(([nome, v]) => (
                  <tr key={nome}>
                    <td className="px-4 py-2 text-slate-900">{nome}</td>
                    <td className="px-4 py-2 text-right text-slate-700">{v.total}</td>
                    <td className="px-4 py-2 text-right text-slate-700">{v.aprovados}</td>
                    <td className="px-4 py-2 text-right text-slate-700 font-medium">
                      {fmtPct(v.aprovados, v.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="text-xs text-slate-500">
          {laudosMes} laudo(s) emitido(s) no mês corrente.
        </div>
      </section>
    </>
  );
}

function NavCard({
  href,
  title,
  hint,
  external,
}: {
  href: string;
  title: string;
  hint: string;
  external?: boolean;
}) {
  const Comp = external ? "a" : (Link as unknown as "a");
  return (
    <Comp
      href={href}
      className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-agua transition-colors"
    >
      <h3 className="text-sm font-semibold text-petroleo">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </Comp>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: "ok" | "bad" | "warn";
}) {
  const toneClass =
    tone === "ok"
      ? "text-emerald-700"
      : tone === "bad"
        ? "text-red-700"
        : tone === "warn"
          ? "text-amber-700"
          : "text-slate-900";
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className={"mt-1 text-2xl font-semibold " + toneClass}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}
