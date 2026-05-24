import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { CLASSIFICACAO_META, NELSON_LABELS } from "@/lib/cep";

export default async function CartaDetalhe({
  params,
}: {
  params: Promise<{ produtoId: string; parametro: string }>;
}) {
  await requireUser();
  const { produtoId, parametro } = await params;
  const param = decodeURIComponent(parametro);

  const [carta, resultados, produto] = await Promise.all([
    prisma.cartaControle.findUnique({
      where: { produtoId_parametro: { produtoId, parametro: param } },
    }),
    prisma.resultado.findMany({
      where: { parametro: param, amostra: { produtoId } },
      orderBy: { dataEnsaio: "asc" },
      take: 200,
      select: {
        id: true,
        valor: true,
        dataEnsaio: true,
        amostra: { select: { numeroOS: true } },
      },
    }),
    prisma.produto.findUnique({
      where: { id: produtoId },
      select: { nome: true, sabor: true, codigo: true },
    }),
  ]);

  if (!produto) notFound();
  if (!carta) {
    return (
      <>
        <PageHeader
          title={`${produto.nome} · ${param}`}
          subtitle="Sem carta calculada — recalcule na página /cep após lançar resultados"
        />
        <Link href="/cep" className="text-sm text-petroleo hover:underline">
          ← Voltar
        </Link>
      </>
    );
  }

  const meta = CLASSIFICACAO_META[carta.classificacao ?? "INSUFICIENTE"];
  const alertas = carta.alertasNelson?.split(",").filter(Boolean) ?? [];

  // SVG chart parameters
  const W = 800;
  const H = 280;
  const PAD = { top: 20, right: 60, bottom: 30, left: 50 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const valores = resultados.map((r) => r.valor);
  const limits = [
    carta.lcs,
    carta.lci,
    ...(carta.lse !== null ? [carta.lse] : []),
    ...(carta.lie !== null ? [carta.lie] : []),
    ...valores,
  ];
  const yMax = Math.max(...limits);
  const yMin = Math.min(...limits);
  const yRange = yMax - yMin || 1;
  const yPad = yRange * 0.1;
  const yTop = yMax + yPad;
  const yBot = yMin - yPad;

  const xOf = (i: number) => PAD.left + (valores.length === 1 ? chartW / 2 : (i * chartW) / (valores.length - 1));
  const yOf = (v: number) => PAD.top + chartH - ((v - yBot) / (yTop - yBot)) * chartH;

  const pathPontos = valores.map((v, i) => `${i === 0 ? "M" : "L"} ${xOf(i)} ${yOf(v)}`).join(" ");

  return (
    <>
      <PageHeader
        title={`${produto.nome} · ${param}`}
        subtitle={`${produto.sabor ?? ""} · cód ${produto.codigo} · ${carta.amostras} ponto(s) na carta`}
        action={
          <Link href="/cep" className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            ← Voltar
          </Link>
        }
      />

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Kpi label="X̄ (média)" value={carta.media.toFixed(3)} />
        <Kpi label="σ (desvio)" value={carta.desvio.toFixed(3)} />
        <Kpi label="Cp" value={carta.cp?.toFixed(2) ?? "—"} />
        <Kpi label="Cpk" value={carta.cpk?.toFixed(2) ?? "—"} />
      </section>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-petroleo">Carta de Controle X̄</h2>
          <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs ${meta.color}`}>
            {meta.icon} {meta.label}
          </span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {/* limites de especificação */}
          {carta.lse !== null && (
            <>
              <line x1={PAD.left} x2={W - PAD.right} y1={yOf(carta.lse)} y2={yOf(carta.lse)} stroke="#7c3aed" strokeDasharray="6 4" strokeWidth={1} />
              <text x={W - PAD.right + 4} y={yOf(carta.lse) + 4} fontSize="10" fill="#7c3aed">LSE {carta.lse.toFixed(2)}</text>
            </>
          )}
          {carta.lie !== null && (
            <>
              <line x1={PAD.left} x2={W - PAD.right} y1={yOf(carta.lie)} y2={yOf(carta.lie)} stroke="#7c3aed" strokeDasharray="6 4" strokeWidth={1} />
              <text x={W - PAD.right + 4} y={yOf(carta.lie) + 4} fontSize="10" fill="#7c3aed">LIE {carta.lie.toFixed(2)}</text>
            </>
          )}

          {/* limites de controle */}
          <line x1={PAD.left} x2={W - PAD.right} y1={yOf(carta.lcs)} y2={yOf(carta.lcs)} stroke="#dc2626" strokeWidth={1.5} />
          <text x={W - PAD.right + 4} y={yOf(carta.lcs) + 4} fontSize="10" fill="#dc2626" fontWeight="600">LCS {carta.lcs.toFixed(2)}</text>

          <line x1={PAD.left} x2={W - PAD.right} y1={yOf(carta.lc)} y2={yOf(carta.lc)} stroke="#059669" strokeWidth={1.5} />
          <text x={W - PAD.right + 4} y={yOf(carta.lc) + 4} fontSize="10" fill="#059669" fontWeight="600">X̄ {carta.lc.toFixed(2)}</text>

          <line x1={PAD.left} x2={W - PAD.right} y1={yOf(carta.lci)} y2={yOf(carta.lci)} stroke="#dc2626" strokeWidth={1.5} />
          <text x={W - PAD.right + 4} y={yOf(carta.lci) + 4} fontSize="10" fill="#dc2626" fontWeight="600">LCI {carta.lci.toFixed(2)}</text>

          {/* linha de pontos */}
          <path d={pathPontos} stroke="#0e7490" strokeWidth={1.5} fill="none" />

          {/* pontos */}
          {valores.map((v, i) => {
            const fora = v > carta.lcs || v < carta.lci;
            return (
              <circle
                key={resultados[i].id}
                cx={xOf(i)}
                cy={yOf(v)}
                r={fora ? 5 : 3.5}
                fill={fora ? "#dc2626" : "#0e7490"}
                stroke="white"
                strokeWidth={1}
              />
            );
          })}

          {/* eixo x: primeira e última data */}
          <text x={PAD.left} y={H - 8} fontSize="10" fill="#64748b">
            {resultados[0] && new Date(resultados[0].dataEnsaio).toLocaleDateString("pt-BR")}
          </text>
          <text x={W - PAD.right} y={H - 8} fontSize="10" fill="#64748b" textAnchor="end">
            {resultados[resultados.length - 1] && new Date(resultados[resultados.length - 1].dataEnsaio).toLocaleDateString("pt-BR")}
          </text>
        </svg>
      </section>

      {alertas.length > 0 && (
        <section className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="text-sm font-semibold text-red-800 mb-2">⚠ Alertas de Regras de Nelson</h2>
          <ul className="space-y-1 text-xs text-red-700">
            {alertas.map((a) => (
              <li key={a}>• {NELSON_LABELS[a] ?? a}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <header className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-petroleo">Pontos da carta (últimos {resultados.length})</h2>
        </header>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Data</th>
              <th className="px-4 py-2 text-left">OS</th>
              <th className="px-4 py-2 text-right">Valor</th>
              <th className="px-4 py-2 text-left">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {resultados.map((r, i) => {
              const fora = r.valor > carta.lcs || r.valor < carta.lci;
              return (
                <tr key={r.id} className={fora ? "bg-red-50" : "hover:bg-slate-50"}>
                  <td className="px-4 py-2 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-2 text-xs">{new Date(r.dataEnsaio).toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-500">{r.amostra.numeroOS}</td>
                  <td className="px-4 py-2 text-right font-mono">{r.valor.toFixed(3)}</td>
                  <td className="px-4 py-2 text-xs">
                    {fora ? (
                      <span className="text-red-700 font-medium">Fora dos limites</span>
                    ) : (
                      <span className="text-slate-500">Dentro</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-petroleo font-mono">{value}</p>
    </div>
  );
}
