import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { LoteInsumoForm } from "../_components/LoteInsumoForm";
import { StatusLoteInsumoSelect } from "../_components/StatusLoteInsumoSelect";
import { ExcluirLoteInsumoButton } from "../_components/ExcluirLoteInsumoButton";
import { EspecInsumoForm } from "../_components/EspecInsumoForm";

const TIPO_LABEL: Record<string, string> = {
  AGUA: "Água",
  ACUCAR: "Açúcar",
  HFCS: "HFCS",
  CO2: "CO₂",
  CONCENTRADO: "Concentrado",
  ESSENCIA: "Essência",
  EDULCORANTE: "Edulcorante",
  ACIDULANTE: "Acidulante",
  CONSERVANTE: "Conservante",
  CORANTE: "Corante",
  OUTRO: "Outro",
};

const STATUS_CLASS: Record<string, string> = {
  EM_ANALISE: "bg-amber-50 text-amber-700 border-amber-200",
  APROVADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REPROVADO: "bg-red-50 text-red-700 border-red-200",
  QUARENTENA: "bg-slate-100 text-slate-600 border-slate-200",
};

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

function diasParaVencer(validade: Date): number {
  const ms = new Date(validade).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default async function InsumoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const insumo = await prisma.insumo.findUnique({
    where: { id },
    include: {
      fornecedor: true,
      lotes: { orderBy: { createdAt: "desc" } },
      especificacoes: { orderBy: { parametro: "asc" } },
    },
  });

  if (!insumo) notFound();

  return (
    <>
      <PageHeader
        title={insumo.nome}
        subtitle={`${TIPO_LABEL[insumo.tipo] ?? insumo.tipo} · ${insumo.fornecedor.razaoSocial} · código ${insumo.codigo}`}
        action={
          <Link href="/insumos" className="text-sm text-slate-600 hover:underline">
            ← Voltar
          </Link>
        }
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">Lotes recebidos</h2>
          {insumo.lotes.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-400 text-sm">
              Nenhum lote registrado.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Lote</th>
                    <th className="px-3 py-2 text-left">Fabricação</th>
                    <th className="px-3 py-2 text-left">Validade</th>
                    <th className="px-3 py-2 text-right">Quantidade</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {insumo.lotes.map((l) => {
                    const dias = diasParaVencer(l.dataValidade);
                    const venc =
                      dias < 0
                        ? "Vencido"
                        : dias <= 30
                          ? `Vence em ${dias}d`
                          : `${dias}d`;
                    return (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono text-xs text-slate-700">
                          {l.loteFornecedor}
                          {l.certificadoUrl && (
                            <a
                              href={l.certificadoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-2 text-petroleo underline"
                            >
                              CoA
                            </a>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{fmtDate(l.dataFabricacao)}</td>
                        <td className="px-3 py-2 text-slate-600">
                          <div>{fmtDate(l.dataValidade)}</div>
                          <div
                            className={
                              "text-[10px] " +
                              (dias < 0 ? "text-red-600" : dias <= 30 ? "text-amber-700" : "text-slate-400")
                            }
                          >
                            {venc}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right text-slate-700">
                          {l.quantidade} {l.unidade}
                        </td>
                        <td className="px-3 py-2">
                          <StatusLoteInsumoSelect
                            id={l.id}
                            current={l.status}
                            className={STATUS_CLASS[l.status] ?? ""}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <ExcluirLoteInsumoButton id={l.id} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">Registrar novo lote</h2>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <LoteInsumoForm insumoId={insumo.id} unidadePadrao={insumo.unidadePadrao} />
          </div>
        </aside>
      </section>

      {/* Especificações de aprovação */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Especificações de aprovação</h2>
        <div className="mb-3 rounded-lg border border-slate-200 bg-white p-4">
          <EspecInsumoForm insumoId={insumo.id} />
        </div>
        {insumo.especificacoes.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-400 text-xs">
            Nenhuma especificação cadastrada. Adicione os parâmetros de aprovação acima.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Parâmetro</th>
                  <th className="px-3 py-2 text-right">Mín.</th>
                  <th className="px-3 py-2 text-right">Máx.</th>
                  <th className="px-3 py-2 text-left">Un.</th>
                  <th className="px-3 py-2 text-left">Método</th>
                  <th className="px-3 py-2 text-left">Obrigat.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {insumo.especificacoes.map((e) => (
                  <tr key={e.id}>
                    <td className="px-3 py-2 text-xs">{e.parametro}</td>
                    <td className="px-3 py-2 text-right text-xs">{e.minimo ?? "—"}</td>
                    <td className="px-3 py-2 text-right text-xs">{e.maximo ?? "—"}</td>
                    <td className="px-3 py-2 text-xs">{e.unidade}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{e.metodo ?? "—"}</td>
                    <td className="px-3 py-2 text-xs">
                      {e.obrigatorio ? <span className="text-petroleo">Sim</span> : <span className="text-slate-500">Não</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
