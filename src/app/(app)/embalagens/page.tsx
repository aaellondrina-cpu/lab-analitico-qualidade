import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { ExcluirEmbalagemButton } from "./_components/ExcluirEmbalagemButton";
import { StatusEmbalagemSelect } from "./_components/StatusEmbalagemSelect";

const TIPO_LABEL: Record<string, string> = {
  PET: "PET",
  VIDRO_RETORNAVEL: "Vidro retornável",
  VIDRO_NAO_RETORNAVEL: "Vidro não retornável",
  LATA: "Lata",
  TAMPA: "Tampa",
  ROTULO: "Rótulo",
};

const STATUS_CLASS: Record<string, string> = {
  EM_ANALISE: "bg-amber-50 text-amber-700 border-amber-200",
  APROVADA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REPROVADA: "bg-red-50 text-red-700 border-red-200",
  DESCARTE: "bg-slate-100 text-slate-600 border-slate-200",
};

export default async function EmbalagensPage() {
  await requireUser();
  const embalagens = await prisma.embalagem.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { amostras: true } } },
  });

  return (
    <>
      <PageHeader
        title="Embalagens"
        subtitle="Controle de qualidade de PET, vidro retornável, tampa e rótulo"
        action={
          <Link
            href="/embalagens/nova"
            className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark"
          >
            + Nova embalagem
          </Link>
        }
      />

      {embalagens.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhuma embalagem registrada.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Fornecedor / Lote</th>
                <th className="px-4 py-3 text-left">Especificação</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Amostras</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {embalagens.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{TIPO_LABEL[e.tipo] ?? e.tipo}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <div>{e.fornecedor}</div>
                    <div className="text-xs text-slate-400 font-mono">{e.loteFornecedor}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 space-y-0.5">
                    {e.volumeNominalMl != null && <div>Volume: {e.volumeNominalMl} ml</div>}
                    {e.pesoGramas != null && <div>Peso: {e.pesoGramas} g</div>}
                    {e.espessuraMm != null && <div>Espessura: {e.espessuraMm} mm</div>}
                    {e.resistenciaBar != null && <div>Resistência: {e.resistenciaBar} bar</div>}
                    {e.torqueNcm != null && <div>Torque: {e.torqueNcm} N·cm</div>}
                    {e.numeroTrips != null && <div>Trips: {e.numeroTrips}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusEmbalagemSelect
                      id={e.id}
                      current={e.status}
                      className={STATUS_CLASS[e.status] ?? ""}
                    />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{e._count.amostras}</td>
                  <td className="px-4 py-3 text-right">
                    <ExcluirEmbalagemButton id={e.id} disabled={e._count.amostras > 0} />
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
