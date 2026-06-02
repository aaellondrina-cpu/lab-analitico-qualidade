import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR");
}

function fmtNum(n: number) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

export default async function PortalEstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  await requireCliente();
  const { tipo } = await searchParams;

  const where = tipo === "ENTRADA" || tipo === "SAIDA" ? { tipo } : {};

  const [movs, todasEntradas, todasSaidas] = await Promise.all([
    prisma.movimentacaoEstoque.findMany({
      where,
      include: {
        lote: { include: { produto: { select: { codigo: true, nome: true } } } },
        cliente: { select: { razaoSocial: true } },
      },
      orderBy: { data: "desc" },
      take: 100,
    }),
    prisma.movimentacaoEstoque.groupBy({ by: ["loteId"], where: { tipo: "ENTRADA" }, _sum: { quantidade: true } }),
    prisma.movimentacaoEstoque.groupBy({ by: ["loteId"], where: { tipo: "SAIDA" }, _sum: { quantidade: true } }),
  ]);

  const saldoPorLote = new Map<string, number>();
  for (const e of todasEntradas) saldoPorLote.set(e.loteId, (e._sum.quantidade ?? 0));
  for (const s of todasSaidas) saldoPorLote.set(s.loteId, (saldoPorLote.get(s.loteId) ?? 0) - (s._sum.quantidade ?? 0));

  const lotesComSaldo = Array.from(saldoPorLote.entries()).filter(([, q]) => q > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque & Expedição"
        subtitle="Movimentações por lote — base para rastreabilidade e Declaração Anual MAPA"
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você acompanha as movimentações de estoque (entradas e saídas)
        por lote, base da rastreabilidade de distribuição. Tela de consulta.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card title="Lotes em estoque" value={String(lotesComSaldo)} />
        <Card title="Movimentações (90d)" value={String(movs.length)} />
        <Card title="Total entradas" value={String(todasEntradas.length)} />
      </div>

      <div className="flex gap-2 text-xs">
        <Link href="/portal/estoque" className={"rounded-md border px-3 py-1.5 " + (!tipo ? "border-petroleo bg-petroleo/5 text-petroleo" : "border-slate-200 hover:bg-slate-50")}>
          Todas
        </Link>
        <Link href="/portal/estoque?tipo=ENTRADA" className={"rounded-md border px-3 py-1.5 " + (tipo === "ENTRADA" ? "border-petroleo bg-petroleo/5 text-petroleo" : "border-slate-200 hover:bg-slate-50")}>
          Entradas
        </Link>
        <Link href="/portal/estoque?tipo=SAIDA" className={"rounded-md border px-3 py-1.5 " + (tipo === "SAIDA" ? "border-petroleo bg-petroleo/5 text-petroleo" : "border-slate-200 hover:bg-slate-50")}>
          Saídas
        </Link>
      </div>

      {movs.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhuma movimentação registrada.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Lote</th>
                <th className="px-4 py-3 text-left">Produto</th>
                <th className="px-4 py-3 text-right">Quantidade</th>
                <th className="px-4 py-3 text-left">Cliente/Local</th>
                <th className="px-4 py-3 text-left">NF/Transp.</th>
                <th className="px-4 py-3 text-left">Resp.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movs.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs">
                    <span className={
                      "inline-block rounded-md border px-2 py-0.5 " +
                      (m.tipo === "ENTRADA" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-blue-50 text-blue-700")
                    }>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{fmtDate(m.data)}</td>
                  <td className="px-4 py-3 text-xs font-mono">{m.lote.numero}</td>
                  <td className="px-4 py-3 text-xs">{m.lote.produto.codigo}</td>
                  <td className="px-4 py-3 text-right text-xs">{fmtNum(m.quantidade)} {m.unidade}</td>
                  <td className="px-4 py-3 text-xs text-slate-700">
                    {m.tipo === "SAIDA" ? (m.cliente?.razaoSocial ?? "—") : (m.localizacao ?? "—")}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {m.notaFiscal ? <div>NF {m.notaFiscal}</div> : null}
                    {m.transportadora ? <div className="text-slate-500">{m.transportadora}</div> : null}
                  </td>
                  <td className="px-4 py-3 text-xs">{m.responsavel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
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
