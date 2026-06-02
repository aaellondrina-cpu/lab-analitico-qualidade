import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

const STATUS_BADGE: Record<string, string> = {
  APROVADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  LIBERADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  EXPEDIDO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REPROVADO: "bg-red-50 text-red-700 border-red-200",
  RETIDO: "bg-amber-50 text-amber-700 border-amber-200",
  EM_PRODUCAO: "bg-blue-50 text-blue-700 border-blue-200",
  FINALIZADO: "bg-slate-100 text-slate-700 border-slate-200",
};

export default async function PortalLivroProducaoPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string }>;
}) {
  await requireCliente();
  const { ano: anoQuery } = await searchParams;
  const ano = anoQuery ? parseInt(anoQuery, 10) : new Date().getFullYear();

  const inicio = new Date(ano, 0, 1);
  const fim = new Date(ano + 1, 0, 1);

  const lotes = await prisma.lote.findMany({
    where: { dataInicioProducao: { gte: inicio, lt: fim } },
    include: {
      produto: { select: { codigo: true, nome: true, mapaProdutoNumero: true } },
      consumos: { include: { loteInsumo: { include: { insumo: { select: { nome: true, codigo: true } } } } } },
      amostras: { select: { id: true, numeroOS: true, status: true } },
    },
    orderBy: { dataInicioProducao: "asc" },
  });

  const totalLitros = lotes.reduce((s, l) => {
    if (!l.volumeTotal) return s;
    const m = l.volumeTotal.match(/(\d+(?:[.,]\d+)?)\s*L/i);
    if (!m) return s;
    return s + parseFloat(m[1].replace(",", "."));
  }, 0);

  const anos = [ano - 2, ano - 1, ano, ano + 1];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Livro de Produção — ${ano}`}
        subtitle="Registro cronológico exigido pelo MAPA (fiscalização) — Decreto 6.871/2009"
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você consulta o livro de produção do ano — lotes, volumes,
        insumos consumidos e análises de cada produção. Tela de consulta.
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {anos.map((a) => (
          <a key={a} href={`/portal/relatorios/livro-producao?ano=${a}`}
            className={"rounded-md border px-3 py-1.5 " + (a === ano ? "border-petroleo bg-petroleo/5 text-petroleo" : "border-slate-200 hover:bg-slate-50")}>
            {a}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card title="Lotes no ano" value={String(lotes.length)} />
        <Card title="Volume total (L)" value={totalLitros.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} />
        <Card title="Análises emitidas" value={String(lotes.reduce((s, l) => s + l.amostras.length, 0))} />
      </div>

      {lotes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum lote registrado em {ano}.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Data</th>
                <th className="px-3 py-2 text-left">Produto</th>
                <th className="px-3 py-2 text-left">Reg. MAPA</th>
                <th className="px-3 py-2 text-left">Lote</th>
                <th className="px-3 py-2 text-left">Volume</th>
                <th className="px-3 py-2 text-left">Insumos consumidos</th>
                <th className="px-3 py-2 text-left">Análises</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lotes.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 align-top">
                  <td className="px-3 py-2 text-xs text-slate-600">{fmtDate(l.dataInicioProducao)}</td>
                  <td className="px-3 py-2 text-xs">
                    <div className="font-medium text-slate-900">{l.produto.codigo}</div>
                    <div className="text-slate-500">{l.produto.nome}</div>
                  </td>
                  <td className="px-3 py-2 text-xs font-mono text-slate-600">
                    {l.produto.mapaProdutoNumero ?? <span className="text-red-600">pendente</span>}
                  </td>
                  <td className="px-3 py-2 text-xs font-mono">{l.numero}</td>
                  <td className="px-3 py-2 text-xs text-slate-700">{l.volumeTotal ?? "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {l.consumos.length === 0 ? "—" : (
                      <ul className="space-y-0.5">
                        {l.consumos.map((c) => (
                          <li key={c.id}>{c.loteInsumo.insumo.nome} ({c.quantidade}{c.unidade})</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {l.amostras.length === 0 ? "—" : (
                      <ul className="space-y-0.5">
                        {l.amostras.map((a) => <li key={a.id} className="font-mono">{a.numeroOS}</li>)}
                      </ul>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className={"inline-block rounded-md border px-2 py-0.5 text-xs " + (STATUS_BADGE[l.status] ?? "border-slate-200 bg-slate-50 text-slate-600")}>
                      {l.status}
                    </span>
                  </td>
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
