import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { tipoPontoLabel } from "@/lib/constants";
import { PontoForm } from "./_components/PontoForm";
import { ExcluirPontoButton } from "./_components/ExcluirPontoButton";

export default async function PontosColetaPage() {
  await requireUser();
  const pontos = await prisma.pontoColeta.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { amostras: true } } },
  });

  return (
    <>
      <PageHeader
        title="Pontos de Coleta"
        subtitle={`${pontos.length} ponto${pontos.length === 1 ? "" : "s"} cadastrado${pontos.length === 1 ? "" : "s"}`}
      />

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-petroleo mb-3">Novo ponto de coleta</h2>
        <PontoForm />
      </section>

      {pontos.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum ponto cadastrado ainda.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Localização</th>
                <th className="px-4 py-3 text-right">Amostras</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pontos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{p.nome}</td>
                  <td className="px-4 py-3 text-slate-700">{tipoPontoLabel(p.tipo)}</td>
                  <td className="px-4 py-3 text-slate-600">{p.localizacao ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{p._count.amostras}</td>
                  <td className="px-4 py-3 text-right">
                    <ExcluirPontoButton id={p.id} disabled={p._count.amostras > 0} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
