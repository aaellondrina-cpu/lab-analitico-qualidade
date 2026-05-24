import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { TIPO_PERIGO_META, NIVEL_META, calcularRisco, RISCO_META } from "@/lib/appcc-meta";
import { MonitoramentoForm } from "../_components/MonitoramentoForm";

function fmtDate(d: Date) {
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default async function PCCDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const pcc = await prisma.pCC.findUnique({
    where: { id },
    include: {
      monitoramentos: {
        orderBy: { data: "desc" },
        take: 50,
      },
    },
  });

  if (!pcc) notFound();

  const risco = calcularRisco(pcc.probabilidade, pcc.severidade);
  const riscoMeta = RISCO_META[risco];
  const tipoMeta = TIPO_PERIGO_META[pcc.tipoPerigo];
  const limites = [
    pcc.limiteCriticoMin !== null ? `≥ ${pcc.limiteCriticoMin}` : null,
    pcc.limiteCriticoMax !== null ? `≤ ${pcc.limiteCriticoMax}` : null,
  ]
    .filter(Boolean)
    .join(" e ");

  const conformidade = pcc.monitoramentos.length
    ? pcc.monitoramentos.filter((m) => m.conforme).length / pcc.monitoramentos.length
    : 0;

  return (
    <>
      <PageHeader
        title={`${pcc.numero} · ${pcc.etapa}`}
        subtitle={pcc.perigo}
        action={
          <Link href="/appcc" className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            ← Voltar
          </Link>
        }
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs ${tipoMeta?.color ?? ""}`}>{tipoMeta?.label}</span>
            <span className={`rounded-md border px-2 py-0.5 text-xs ${riscoMeta.color}`}>{riscoMeta.label}</span>
            <span className="text-xs text-slate-500">
              Probabilidade: <span className={`px-1.5 rounded ${NIVEL_META[pcc.probabilidade]?.color ?? ""}`}>{NIVEL_META[pcc.probabilidade]?.label}</span>
            </span>
            <span className="text-xs text-slate-500">
              Severidade: <span className={`px-1.5 rounded ${NIVEL_META[pcc.severidade]?.color ?? ""}`}>{NIVEL_META[pcc.severidade]?.label}</span>
            </span>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Medida de controle</div>
            <div className="text-sm text-slate-700">{pcc.medidaControle}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Ação corretiva</div>
            <div className="text-sm text-slate-700">{pcc.acaoCorretiva}</div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2 text-sm">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Limite crítico</div>
            <div className="font-mono">{limites || "—"} {pcc.unidade}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Frequência</div>
            <div>{pcc.frequencia}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Responsável</div>
            <div>{pcc.responsavel}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500">Conformidade</div>
            <div className="text-lg font-semibold text-petroleo">{(conformidade * 100).toFixed(0)}%</div>
            <div className="text-[11px] text-slate-500">{pcc.monitoramentos.length} leitura(s)</div>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-petroleo mb-3">Nova leitura</h2>
        <MonitoramentoForm pccId={pcc.id} unidade={pcc.unidade} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <header className="px-4 py-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-petroleo">Histórico de monitoramento</h2>
        </header>
        {pcc.monitoramentos.length === 0 ? (
          <p className="px-4 py-6 text-center text-slate-400 text-sm">Nenhuma leitura registrada ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Data</th>
                <th className="px-4 py-2 text-right">Valor</th>
                <th className="px-4 py-2 text-left">Responsável</th>
                <th className="px-4 py-2 text-left">Observação</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pcc.monitoramentos.map((m) => (
                <tr key={m.id} className={m.conforme ? "" : "bg-red-50"}>
                  <td className="px-4 py-2 text-xs">{fmtDate(m.data)}</td>
                  <td className="px-4 py-2 text-right font-mono">
                    {m.valor} <span className="text-xs text-slate-500">{pcc.unidade}</span>
                  </td>
                  <td className="px-4 py-2 text-slate-700">{m.responsavel}</td>
                  <td className="px-4 py-2 text-xs text-slate-600">{m.observacao ?? "—"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[11px] " +
                        (m.conforme ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")
                      }
                    >
                      {m.conforme ? "Conforme" : "Fora do limite"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
