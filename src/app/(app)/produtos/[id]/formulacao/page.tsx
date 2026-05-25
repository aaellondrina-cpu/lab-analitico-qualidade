import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { FormulacaoForm } from "./_components/FormulacaoForm";
import { IngredienteForm } from "./_components/IngredienteForm";

function fmtDate(d: Date) { return new Date(d).toLocaleDateString("pt-BR"); }
function fmtNum(n: number) { return n.toLocaleString("pt-BR", { maximumFractionDigits: 3 }); }

export default async function FormulacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const produto = await prisma.produto.findUnique({ where: { id } });
  if (!produto) notFound();

  const [formulacoes, insumos] = await Promise.all([
    prisma.formulacao.findMany({
      where: { produtoId: id },
      include: {
        ingredientes: { include: { insumo: { select: { nome: true, codigo: true } } } },
      },
      orderBy: { versao: "desc" },
    }),
    prisma.insumo.findMany({ select: { id: true, nome: true, codigo: true }, orderBy: { nome: "asc" } }),
  ]);

  const vigente = formulacoes.find((f) => f.vigente) ?? null;

  return (
    <>
      <PageHeader
        title={`Formulação — ${produto.nome}`}
        subtitle={`Receita oficial do produto vinculada ao registro MAPA · ${produto.codigo}`}
        action={
          <Link href={`/produtos/${id}/editar`} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50">
            ← Voltar ao produto
          </Link>
        }
      />

      {/* Nova versão da formulação */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <div className="mb-3 text-xs font-medium text-slate-700">
          {vigente ? `Criar nova versão (atual: v${vigente.versao})` : "Criar primeira versão da formulação"}
        </div>
        <FormulacaoForm produtoId={id} />
      </div>

      {/* Adicionar ingrediente à versão vigente */}
      {vigente && (
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 text-xs font-medium text-slate-700">Adicionar ingrediente à v{vigente.versao}</div>
          <IngredienteForm formulacaoId={vigente.id} insumos={insumos} />
        </div>
      )}

      {/* Histórico de versões */}
      {formulacoes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhuma formulação cadastrada.
        </div>
      ) : (
        <div className="space-y-4">
          {formulacoes.map((f) => (
            <div key={f.id} className={"rounded-lg border bg-white " + (f.vigente ? "border-petroleo" : "border-slate-200")}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="text-sm font-medium">
                  Versão {f.versao}
                  {f.vigente && <span className="ml-2 rounded-md bg-petroleo/10 text-petroleo px-2 py-0.5 text-[10px]">VIGENTE</span>}
                </div>
                <div className="text-xs text-slate-500">
                  Aprovada por {f.aprovadaPor} em {fmtDate(f.dataAprovacao)}
                </div>
              </div>
              {f.ingredientes.length === 0 ? (
                <div className="p-4 text-xs text-slate-400">Nenhum ingrediente registrado.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-4 py-2 text-left">Ingrediente</th>
                      <th className="px-4 py-2 text-right">Qtd/1000L</th>
                      <th className="px-4 py-2 text-left">Função</th>
                      <th className="px-4 py-2 text-left">INS</th>
                      <th className="px-4 py-2 text-left">Legislação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {f.ingredientes.map((ing) => (
                      <tr key={ing.id}>
                        <td className="px-4 py-2 text-xs">
                          {ing.insumo ? `${ing.insumo.nome} (${ing.insumo.codigo})` : (ing.nomeLivre ?? "—")}
                        </td>
                        <td className="px-4 py-2 text-right text-xs">{fmtNum(ing.quantidade)} {ing.unidade}</td>
                        <td className="px-4 py-2 text-xs">{ing.funcao}</td>
                        <td className="px-4 py-2 text-xs text-slate-500">{ing.ins ?? "—"}</td>
                        <td className="px-4 py-2 text-xs text-slate-500">{ing.legislacao ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
