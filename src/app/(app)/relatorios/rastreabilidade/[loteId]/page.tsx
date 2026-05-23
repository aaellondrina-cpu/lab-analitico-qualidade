import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { PrintButton } from "@/app/(app)/laudos/_components/PrintButton";

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function fmtDateOnly(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function RastreabilidadePage({
  params,
}: {
  params: Promise<{ loteId: string }>;
}) {
  await requireUser();
  const { loteId } = await params;

  const lote = await prisma.lote.findUnique({
    where: { id: loteId },
    include: {
      produto: true,
      consumos: {
        include: {
          loteInsumo: {
            include: {
              insumo: { include: { fornecedor: true } },
            },
          },
        },
      },
      amostras: {
        include: {
          cliente: { select: { razaoSocial: true } },
          resultados: { orderBy: { dataEnsaio: "asc" } },
          ncs: true,
          laudo: { select: { id: true, numero: true, conclusao: true } },
          pontoColeta: { select: { nome: true } },
        },
        orderBy: { dataColeta: "asc" },
      },
    },
  });

  if (!lote) notFound();

  const totalResultados = lote.amostras.reduce((acc, a) => acc + a.resultados.length, 0);
  const conformes = lote.amostras.reduce(
    (acc, a) => acc + a.resultados.filter((r) => r.conformidade === "CONFORME").length,
    0,
  );
  const ncTotal = lote.amostras.reduce((acc, a) => acc + a.ncs.length, 0);
  const pctConformidade = totalResultados > 0 ? (conformes / totalResultados) * 100 : 100;

  return (
    <>
      <PageHeader
        title={`Rastreabilidade · Lote ${lote.numero}`}
        subtitle={`${lote.produto.nome}${lote.sabor ? ` · ${lote.sabor}` : ""}`}
        action={
          <div className="flex gap-2 print:hidden">
            <Link href="/relatorios/rastreabilidade" className="text-sm text-slate-600 hover:underline px-3 py-2">
              ← Voltar
            </Link>
            <PrintButton />
          </div>
        }
      />

      <article className="rounded-lg border border-slate-300 bg-white p-8 print:border-0 print:p-0 space-y-6">
        <header className="pb-3 border-b border-slate-300">
          <div className="text-xs text-slate-500 uppercase tracking-wide">
            LimsQual · Relatório de Rastreabilidade
          </div>
          <h1 className="mt-1 text-xl font-bold text-petroleo">Lote {lote.numero}</h1>
          <div className="mt-1 text-sm text-slate-600">
            {lote.produto.nome}
            {lote.sabor ? ` · ${lote.sabor}` : ""} · Status:{" "}
            <span className="font-medium">{lote.status}</span>
          </div>
        </header>

        {/* Dados do lote */}
        <section className="grid grid-cols-2 gap-4 text-sm">
          <Info k="Início da produção" v={fmtDate(lote.dataInicioProducao)} />
          <Info k="Fim da produção" v={fmtDate(lote.dataFimProducao)} />
          <Info k="Volume" v={lote.volumeTotal ?? "—"} />
          <Info k="Unidades produzidas" v={lote.unidadesProduzidas?.toString() ?? "—"} />
          <Info k="Linha" v={lote.linha ?? "—"} />
          <Info k="Turno" v={lote.turno ?? "—"} />
          <Info k="Responsável de produção" v={lote.responsavelProducao ?? "—"} />
        </section>

        {/* Insumos consumidos */}
        <section>
          <h2 className="text-xs uppercase tracking-wide text-slate-500 mb-2">
            Insumos consumidos ({lote.consumos.length})
          </h2>
          {lote.consumos.length === 0 ? (
            <div className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Nenhum consumo registrado para este lote.
            </div>
          ) : (
            <table className="w-full text-sm border border-slate-300">
              <thead className="bg-slate-100 text-xs uppercase">
                <tr>
                  <th className="border-b border-slate-300 px-3 py-2 text-left">Insumo</th>
                  <th className="border-b border-slate-300 px-3 py-2 text-left">Fornecedor</th>
                  <th className="border-b border-slate-300 px-3 py-2 text-left">Lote fornecedor</th>
                  <th className="border-b border-slate-300 px-3 py-2 text-left">Validade</th>
                  <th className="border-b border-slate-300 px-3 py-2 text-right">Consumido</th>
                </tr>
              </thead>
              <tbody>
                {lote.consumos.map((c) => (
                  <tr key={c.id}>
                    <td className="border-b border-slate-200 px-3 py-2">
                      {c.loteInsumo.insumo.nome}{" "}
                      <span className="text-xs text-slate-500 font-mono">
                        ({c.loteInsumo.insumo.codigo})
                      </span>
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 text-xs">
                      {c.loteInsumo.insumo.fornecedor.razaoSocial}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 font-mono text-xs">
                      {c.loteInsumo.loteFornecedor}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 text-xs">
                      {fmtDateOnly(c.loteInsumo.dataValidade)}
                    </td>
                    <td className="border-b border-slate-200 px-3 py-2 text-right">
                      {c.quantidade} {c.unidade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Amostras e resultados */}
        <section>
          <h2 className="text-xs uppercase tracking-wide text-slate-500 mb-2">
            Amostras analisadas ({lote.amostras.length})
          </h2>
          {lote.amostras.length === 0 ? (
            <div className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Nenhuma amostra registrada para este lote.
            </div>
          ) : (
            <div className="space-y-4">
              {lote.amostras.map((a) => (
                <div key={a.id} className="border border-slate-300 rounded-md p-4">
                  <header className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="font-mono font-semibold">{a.numeroOS}</span>
                      <span className="ml-2 text-xs text-slate-500">
                        {a.tipoAnalise} · {a.pontoColeta?.nome ?? "—"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">{fmtDateOnly(a.dataColeta)}</div>
                  </header>
                  {a.resultados.length > 0 && (
                    <table className="w-full text-xs border border-slate-200 mb-2">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-2 py-1 text-left border-b border-slate-200">Parâmetro</th>
                          <th className="px-2 py-1 text-right border-b border-slate-200">Valor</th>
                          <th className="px-2 py-1 text-left border-b border-slate-200">Unid.</th>
                          <th className="px-2 py-1 text-left border-b border-slate-200">Conformidade</th>
                          <th className="px-2 py-1 text-left border-b border-slate-200">Analista</th>
                        </tr>
                      </thead>
                      <tbody>
                        {a.resultados.map((r) => (
                          <tr key={r.id}>
                            <td className="px-2 py-1 border-b border-slate-100">{r.parametro}</td>
                            <td className="px-2 py-1 text-right font-mono border-b border-slate-100">{r.valor}</td>
                            <td className="px-2 py-1 border-b border-slate-100">{r.unidade}</td>
                            <td className="px-2 py-1 border-b border-slate-100">{r.conformidade}</td>
                            <td className="px-2 py-1 border-b border-slate-100">{r.analista}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {a.ncs.length > 0 && (
                    <div className="text-xs text-red-700">
                      {a.ncs.length} não-conformidade(s) registrada(s):{" "}
                      {a.ncs.map((n) => n.numero).join(", ")}
                    </div>
                  )}
                  {a.laudo && (
                    <div className="text-xs text-emerald-700 mt-1">
                      Laudo {a.laudo.numero} — {a.laudo.conclusao}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Resumo */}
        <section className="rounded-md bg-slate-50 border border-slate-200 p-4">
          <h2 className="text-xs uppercase tracking-wide text-slate-500 mb-2">Resumo</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-slate-500">Resultados analíticos</div>
              <div className="text-lg font-semibold">{totalResultados}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">% Conformidade</div>
              <div
                className={
                  "text-lg font-semibold " +
                  (pctConformidade === 100
                    ? "text-emerald-700"
                    : pctConformidade >= 90
                      ? "text-amber-700"
                      : "text-red-700")
                }
              >
                {pctConformidade.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">NCs registradas</div>
              <div className={"text-lg font-semibold " + (ncTotal > 0 ? "text-red-700" : "text-slate-900")}>
                {ncTotal}
              </div>
            </div>
          </div>
        </section>

        <footer className="text-xs text-slate-400 text-center pt-4 border-t border-slate-200">
          Relatório gerado por LimsQual em {new Date().toLocaleString("pt-BR")}
        </footer>
      </article>
    </>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{k}</div>
      <div className="mt-0.5 text-sm text-slate-900">{v}</div>
    </div>
  );
}
