import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

function fmtBRL(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function CustosPage({
  searchParams,
}: {
  searchParams: Promise<{ produto?: string }>;
}) {
  await requireUser();
  const { produto: produtoFiltro } = await searchParams;

  // Janela dos últimos 90 dias
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 90);

  const where: Record<string, unknown> = { createdAt: { gte: inicio } };
  if (produtoFiltro) where.produtoId = produtoFiltro;

  const [lotes, produtos, lotesInsumoMes, embalagensMes] = await Promise.all([
    prisma.lote.findMany({
      where,
      include: { produto: { select: { id: true, nome: true, codigo: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.produto.findMany({ select: { id: true, codigo: true, nome: true }, orderBy: { codigo: "asc" } }),
    prisma.loteInsumo.findMany({ where: { dataNF: { gte: inicio } }, select: { valorTotal: true } }),
    prisma.embalagem.findMany({ where: { createdAt: { gte: inicio } }, select: { valorTotal: true } }),
  ]);

  const totalInsumos = lotesInsumoMes.reduce((s, x) => s + (x.valorTotal ?? 0), 0);
  const totalEmbalagens = embalagensMes.reduce((s, x) => s + (x.valorTotal ?? 0), 0);

  const lotesComCusto = lotes.filter((l) => l.custoTotal != null);
  const custoMedioLote = lotesComCusto.length
    ? lotesComCusto.reduce((s, l) => s + (l.custoTotal ?? 0), 0) / lotesComCusto.length
    : 0;

  // Custo médio por litro por produto
  const porProduto = new Map<string, { nome: string; litros: number; custo: number; lotes: number }>();
  for (const l of lotes) {
    if (l.custoTotal == null) continue;
    const cur = porProduto.get(l.produtoId) ?? { nome: l.produto.nome, litros: 0, custo: 0, lotes: 0 };
    cur.custo += l.custoTotal;
    cur.lotes += 1;
    // tenta extrair litros do volumeTotal "5000L"
    if (l.volumeTotal) {
      const m = l.volumeTotal.match(/(\d+(?:[.,]\d+)?)\s*L/i);
      if (m) cur.litros += parseFloat(m[1].replace(",", "."));
    }
    porProduto.set(l.produtoId, cur);
  }

  return (
    <>
      <PageHeader
        title="Custos de produção"
        subtitle="Painel financeiro — últimos 90 dias"
      />

      {/* Cards financeiros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card title="Custo médio por lote" value={fmtBRL(custoMedioLote)} />
        <Card title="Total insumos (90d)" value={fmtBRL(totalInsumos)} />
        <Card title="Total embalagens (90d)" value={fmtBRL(totalEmbalagens)} />
        <Card title="Lotes c/ custo apurado" value={`${lotesComCusto.length} / ${lotes.length}`} />
      </div>

      {/* Filtro por produto */}
      <form className="mb-4 flex flex-wrap gap-2 text-xs">
        <Link href="/relatorios/custos" className={"rounded-md border px-3 py-1.5 " + (!produtoFiltro ? "border-petroleo bg-petroleo/5 text-petroleo" : "border-slate-200 hover:bg-slate-50")}>
          Todos
        </Link>
        {produtos.map((p) => (
          <Link key={p.id} href={`/relatorios/custos?produto=${p.id}`}
            className={"rounded-md border px-3 py-1.5 " + (produtoFiltro === p.id ? "border-petroleo bg-petroleo/5 text-petroleo" : "border-slate-200 hover:bg-slate-50")}>
            {p.codigo}
          </Link>
        ))}
      </form>

      {/* Resumo por produto */}
      {porProduto.size > 0 && (
        <div className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="px-4 py-3 border-b border-slate-100 text-xs font-medium text-slate-700">Custo médio por litro — por produto</div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Produto</th>
                <th className="px-4 py-2 text-right">Lotes</th>
                <th className="px-4 py-2 text-right">Litros</th>
                <th className="px-4 py-2 text-right">Custo total</th>
                <th className="px-4 py-2 text-right">R$ / litro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from(porProduto.entries()).map(([id, p]) => (
                <tr key={id}>
                  <td className="px-4 py-2 text-xs text-slate-700">{p.nome}</td>
                  <td className="px-4 py-2 text-right text-xs">{p.lotes}</td>
                  <td className="px-4 py-2 text-right text-xs">{p.litros.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-2 text-right text-xs">{fmtBRL(p.custo)}</td>
                  <td className="px-4 py-2 text-right text-xs font-medium">
                    {p.litros > 0 ? fmtBRL(p.custo / p.litros) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detalhado por lote */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="px-4 py-3 border-b border-slate-100 text-xs font-medium text-slate-700">Detalhamento por lote</div>
        {lotes.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">Nenhum lote no período.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Lote</th>
                <th className="px-4 py-2 text-left">Produto</th>
                <th className="px-4 py-2 text-left">Data</th>
                <th className="px-4 py-2 text-right">Unidades</th>
                <th className="px-4 py-2 text-right">C. Insumos</th>
                <th className="px-4 py-2 text-right">C. Embal.</th>
                <th className="px-4 py-2 text-right">C. Total</th>
                <th className="px-4 py-2 text-right">R$/un</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lotes.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono text-xs">{l.numero}</td>
                  <td className="px-4 py-2 text-xs text-slate-700">{l.produto.codigo}</td>
                  <td className="px-4 py-2 text-xs text-slate-600">{fmtDate(l.dataInicioProducao)}</td>
                  <td className="px-4 py-2 text-right text-xs">{l.unidadesProduzidas ?? "—"}</td>
                  <td className="px-4 py-2 text-right text-xs">{fmtBRL(l.custoInsumos)}</td>
                  <td className="px-4 py-2 text-right text-xs">{fmtBRL(l.custoEmbalagens)}</td>
                  <td className="px-4 py-2 text-right text-xs font-medium">{fmtBRL(l.custoTotal)}</td>
                  <td className="px-4 py-2 text-right text-xs">{fmtBRL(l.custoPorUnidade)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-[11px] uppercase tracking-wider text-slate-400">{title}</div>
      <div className="mt-1 text-xl font-semibold text-petroleo">{value}</div>
    </div>
  );
}
