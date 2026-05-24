import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { TIPO_PERIGO_META, calcularRisco, RISCO_META } from "@/lib/appcc-meta";

function fmtDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default async function APPCCPage() {
  await requireUser();

  const pccs = await prisma.pCC.findMany({
    orderBy: { numero: "asc" },
    include: {
      monitoramentos: {
        orderBy: { data: "desc" },
        take: 1,
      },
      _count: { select: { monitoramentos: true } },
    },
  });

  const totalNaoConformes = pccs.reduce(
    (sum, p) => sum + (p.monitoramentos[0] && !p.monitoramentos[0].conforme ? 1 : 0),
    0,
  );

  return (
    <>
      <PageHeader
        title="Plano APPCC / HACCP"
        subtitle="Análise de Perigos e Pontos Críticos de Controle (ISO 22000, FSSC 22000, RDC 216/ANVISA)"
        action={
          <Link
            href="/appcc/novo"
            className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark"
          >
            + Novo PCC
          </Link>
        }
      />

      <section className="grid grid-cols-3 gap-3 mb-6">
        <SmallStat label="PCCs ativos" value={pccs.filter((p) => p.ativo).length} />
        <SmallStat label="Total cadastrados" value={pccs.length} />
        <SmallStat
          label="Última leitura não conforme"
          value={totalNaoConformes}
          danger={totalNaoConformes > 0}
        />
      </section>

      {pccs.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum PCC cadastrado. Comece criando um Ponto Crítico de Controle.
        </div>
      ) : (
        <div className="space-y-3">
          {pccs.map((pcc) => {
            const risco = calcularRisco(pcc.probabilidade, pcc.severidade);
            const riscoMeta = RISCO_META[risco];
            const tipoMeta = TIPO_PERIGO_META[pcc.tipoPerigo];
            const ultimo = pcc.monitoramentos[0];
            const limites = [
              pcc.limiteCriticoMin !== null ? `≥ ${pcc.limiteCriticoMin}` : null,
              pcc.limiteCriticoMax !== null ? `≤ ${pcc.limiteCriticoMax}` : null,
            ]
              .filter(Boolean)
              .join(" e ");
            return (
              <article
                key={pcc.id}
                className={
                  "rounded-lg border bg-white p-4 " +
                  (!pcc.ativo
                    ? "opacity-60 border-slate-200"
                    : ultimo && !ultimo.conforme
                      ? "border-red-300"
                      : "border-slate-200")
                }
              >
                <header className="flex items-center justify-between mb-3">
                  <div>
                    <Link href={`/appcc/${pcc.id}`} className="font-mono text-sm font-semibold text-petroleo hover:underline">
                      {pcc.numero}
                    </Link>
                    <span className="ml-2 text-sm text-slate-700">{pcc.etapa}</span>
                    {!pcc.ativo && <span className="ml-2 rounded px-2 py-0.5 text-[10px] bg-slate-100 text-slate-500">Inativo</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${tipoMeta?.color ?? ""}`}>{tipoMeta?.label}</span>
                    <span className={`rounded-md border px-2 py-0.5 text-[11px] ${riscoMeta.color}`}>{riscoMeta.label}</span>
                  </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                  <div className="lg:col-span-2 space-y-2">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">Perigo</div>
                      <div className="text-slate-700">{pcc.perigo}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">Medida de controle</div>
                      <div className="text-slate-700">{pcc.medidaControle}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">Limite crítico</div>
                      <div className="font-mono text-xs text-slate-700">
                        {limites || "—"} {pcc.unidade}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">Frequência</div>
                      <div className="text-slate-700">{pcc.frequencia}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">Responsável</div>
                      <div className="text-slate-700">{pcc.responsavel}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">Monitoramentos</div>
                      <div className="text-slate-700">{pcc._count.monitoramentos}</div>
                    </div>
                    {ultimo && (
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                        <div className="text-[10px] uppercase text-slate-500">Última leitura</div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="font-mono text-xs">{ultimo.valor} {pcc.unidade}</span>
                          <span
                            className={
                              "rounded-full px-2 py-0.5 text-[10px] " +
                              (ultimo.conforme ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")
                            }
                          >
                            {ultimo.conforme ? "OK" : "FORA"}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{fmtDate(ultimo.data)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

function SmallStat({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className={"rounded-lg border bg-white p-4 " + (danger ? "border-red-200" : "border-slate-200")}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={"mt-2 text-3xl font-semibold " + (danger ? "text-red-600" : "text-petroleo")}>{value}</p>
    </div>
  );
}
