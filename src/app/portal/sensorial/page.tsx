import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";

const RESULT_CLASS: Record<string, string> = {
  APROVADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REPROVADO: "bg-red-50 text-red-700 border-red-200",
  APROVADO_COM_RESSALVA: "bg-amber-50 text-amber-700 border-amber-200",
  PENDENTE: "bg-slate-100 text-slate-600 border-slate-200",
};

function fmtDate(d: Date) { return new Date(d).toLocaleDateString("pt-BR"); }

export default async function PortalSensorialPage() {
  await requireCliente();

  const avaliacoes = await prisma.avaliacaoSensorial.findMany({
    include: {
      lote: { select: { numero: true, produto: { select: { codigo: true, nome: true } } } },
      itens: true,
      _count: { select: { itens: true } },
    },
    orderBy: { data: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Análise Sensorial"
        subtitle="Painel de degustação por lote (escala hedônica 1-9) — Decreto 6.871/2009"
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você consulta as avaliações sensoriais por lote, com a nota
        média do painel e o resultado de cada degustação. Tela de consulta.
      </div>

      {avaliacoes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhuma avaliação sensorial registrada.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Data</th>
                <th className="px-4 py-2 text-left">Lote</th>
                <th className="px-4 py-2 text-left">Produto</th>
                <th className="px-4 py-2 text-right">Avaliadores</th>
                <th className="px-4 py-2 text-right">Nota média (global)</th>
                <th className="px-4 py-2 text-left">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {avaliacoes.map((a) => {
                const media = a.itens.length
                  ? a.itens.reduce((s, i) => s + i.impressaoGlobal, 0) / a.itens.length
                  : null;
                return (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-xs">{fmtDate(a.data)}</td>
                    <td className="px-4 py-2 text-xs font-mono">{a.lote.numero}</td>
                    <td className="px-4 py-2 text-xs">{a.lote.produto.codigo}</td>
                    <td className="px-4 py-2 text-right text-xs">{a._count.itens}</td>
                    <td className="px-4 py-2 text-right text-xs font-medium">
                      {media !== null ? media.toFixed(1) : "—"}
                    </td>
                    <td className="px-4 py-2">
                      <span className={"inline-block rounded-md border px-2 py-0.5 text-xs " + (RESULT_CLASS[a.resultado] ?? "")}>
                        {a.resultado.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
