import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { DeleteButton } from "@/components/DeleteButton";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { statusAmostra, statusNC, tipoAnaliseLabel } from "@/lib/constants";
import { CONFORMIDADE_META, descreverLimite, type Conformidade } from "@/lib/conformidade";
import { ResultadoForm } from "../_components/ResultadoForm";
import { AprovarButton } from "../_components/AprovarButton";
import { excluirAmostra, excluirResultado } from "../actions";

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default async function AmostraDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const amostra = await prisma.amostra.findUnique({
    where: { id },
    include: {
      cliente: true,
      produto: { include: { especificacoes: true } },
      lote: true,
      pontoColeta: true,
      resultados: { orderBy: { dataEnsaio: "desc" } },
      ncs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!amostra) notFound();

  const equipamentos = await prisma.equipamento.findMany({
    select: { id: true, nome: true, status: true },
    orderBy: { nome: "asc" },
  });

  const s = statusAmostra(amostra.status);
  const canApprove = (user.role === "ADMIN" || user.role === "RESPONSAVEL_TECNICO")
    && amostra.resultados.length > 0
    && amostra.ncs.filter((n) => n.status !== "ENCERRADA").length === 0
    && amostra.status !== "APROVADO"
    && amostra.status !== "LAUDO_EMITIDO";

  return (
    <>
      <PageHeader
        title={amostra.numeroOS}
        subtitle={`${amostra.produto.nome} · Lote ${amostra.lote.numero}${amostra.lote.sabor ? ` · ${amostra.lote.sabor}` : ""}`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/amostras"
              className="rounded-md bg-slate-200 hover:bg-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              ← Voltar
            </Link>
            <span className={`rounded-full px-3 py-1 text-xs ${s.color}`}>{s.label}</span>
            {amostra.status !== "APROVADO" && amostra.status !== "LAUDO_EMITIDO" && (
              <AprovarButton id={amostra.id} canApprove={canApprove} />
            )}
            {amostra.status === "APROVADO" && (
              <Link
                href={`/laudos/emitir/${amostra.id}`}
                className="rounded-md bg-cyan-600 px-3 py-2 text-xs font-medium text-white hover:bg-cyan-700"
              >
                Emitir laudo →
              </Link>
            )}
            {(user.role === "ADMIN" || user.role === "RESPONSAVEL_TECNICO") && (
              <DeleteButton
                onConfirm={excluirAmostra.bind(null, amostra.id)}
                label="Excluir amostra"
                confirmText={`Excluir a amostra ${amostra.numeroOS}? Esta ação não pode ser desfeita.`}
              />
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Info k="Cliente" v={amostra.cliente.razaoSocial} />
        <Info k="Tipo de análise" v={tipoAnaliseLabel(amostra.tipoAnalise)} />
        <Info k="Ponto de coleta" v={amostra.pontoColeta?.nome ?? "—"} />
        <Info k="Data coleta" v={fmtDate(amostra.dataColeta)} />
        <Info k="Recebimento" v={fmtDate(amostra.dataRecebimento)} />
        <Info k="Prazo entrega" v={fmtDate(amostra.prazoEntrega)} />
        <Info k="Volume" v={amostra.volume ?? "—"} />
        <Info k="Temp. transporte" v={amostra.tempTransporte !== null ? `${amostra.tempTransporte} °C` : "—"} />
        <Info k="Integridade" v={amostra.integridadeOk ? "OK" : "Comprometida"} />
      </div>

      <section className="rounded-lg border border-slate-200 bg-white overflow-hidden mb-4">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-petroleo">Resultados ({amostra.resultados.length})</h2>
          <div className="flex items-center gap-2">
            {amostra.status !== "APROVADO" && amostra.status !== "LAUDO_EMITIDO" && (
              <Link
                href={`/amostras/${amostra.id}/resultados`}
                className="text-xs bg-petroleo text-white px-2 py-1 rounded hover:bg-petroleo-dark font-medium"
              >
                Entrada Rápida →
              </Link>
            )}
            {amostra.produto.especificacoes.length > 0 && (
              <span className="text-xs text-slate-500">{amostra.produto.especificacoes.length} parâmetro(s) especificado(s)</span>
            )}
          </div>
        </header>
        {amostra.resultados.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-400">Nenhum resultado lançado ainda.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Parâmetro</th>
                <th className="px-4 py-2 text-right">Valor</th>
                <th className="px-4 py-2">Unidade</th>
                <th className="px-4 py-2">Limite</th>
                <th className="px-4 py-2">Conformidade</th>
                <th className="px-4 py-2">Analista</th>
                <th className="px-4 py-2">Data</th>
                <th className="px-4 py-2 w-px"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {amostra.resultados.map((r) => {
                const espec = amostra.produto.especificacoes.find(
                  (e) => e.parametro.toLowerCase() === r.parametro.toLowerCase(),
                );
                const meta = CONFORMIDADE_META[r.conformidade as Conformidade] ?? CONFORMIDADE_META.CONFORME;
                const canEdit =
                  amostra.status !== "APROVADO" &&
                  amostra.status !== "LAUDO_EMITIDO" &&
                  (user.role === "ADMIN" || user.role === "RESPONSAVEL_TECNICO" || user.role === "ANALISTA");
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-2 font-medium text-slate-900">{r.parametro}</td>
                    <td className="px-4 py-2 text-right font-mono">{r.valor}</td>
                    <td className="px-4 py-2 text-slate-600">{r.unidade}</td>
                    <td className="px-4 py-2 text-xs text-slate-600">
                      {espec ? descreverLimite(espec.minimo, espec.maximo, espec.unidade) : "—"}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${meta.color}`}>{meta.icon} {meta.label}</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-700">{r.analista}</td>
                    <td className="px-4 py-2 text-xs text-slate-500">{fmtDate(r.dataEnsaio)}</td>
                    <td className="px-4 py-2 text-right">
                      {canEdit && (
                        <DeleteButton
                          onConfirm={excluirResultado.bind(null, r.id, amostra.id)}
                          label="Excluir"
                          size="sm"
                          confirmText={`Excluir o resultado de ${r.parametro}?`}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {amostra.status !== "APROVADO" && amostra.status !== "LAUDO_EMITIDO" && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 mb-4">
          <h2 className="text-sm font-semibold text-petroleo mb-3">Lançar resultado</h2>
          {amostra.produto.especificacoes.length === 0 && (
            <p className="mb-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
              ⚠ Este produto não tem especificações cadastradas. Resultados serão registrados sem avaliação de conformidade.
            </p>
          )}
          <ResultadoForm
            amostraId={amostra.id}
            especificacoes={amostra.produto.especificacoes.map((e) => ({
              parametro: e.parametro,
              unidade: e.unidade,
              metodo: e.metodo,
              minimo: e.minimo,
              maximo: e.maximo,
            }))}
            equipamentos={equipamentos}
            defaultAnalista={user.name ?? user.email ?? ""}
          />
        </section>
      )}

      {amostra.ncs.length > 0 && (
        <section className="rounded-lg border border-red-200 bg-red-50 overflow-hidden">
          <header className="border-b border-red-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-red-900">⚠ Não Conformidades ({amostra.ncs.length})</h2>
          </header>
          <ul className="divide-y divide-red-100">
            {amostra.ncs.map((nc) => {
              const ncStatus = statusNC(nc.status);
              return (
              <li key={nc.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs text-red-700">{nc.numero}</div>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] border ${ncStatus.color}`}>{ncStatus.label}</span>
                </div>
                <div className="mt-1 text-slate-800">
                  <strong>{nc.parametro}:</strong> {nc.descricao}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Responsável: {nc.responsavel} · Prazo: {fmtDate(nc.prazo)}
                </div>
              </li>
              );
            })}
          </ul>
        </section>
      )}
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
