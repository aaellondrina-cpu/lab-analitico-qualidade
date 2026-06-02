import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";

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

const STATUS_LABEL: Record<string, string> = {
  EM_ANALISE: "Em análise",
  APROVADA: "Aprovada",
  REPROVADA: "Reprovada",
  DESCARTE: "Descarte",
};

export default async function PortalEmbalagensPage() {
  await requireCliente();
  const embalagens = await prisma.embalagem.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { amostras: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Embalagens"
        subtitle="Controle de qualidade de PET, vidro retornável, tampa e rótulo"
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você consulta o controle de qualidade das embalagens (peso,
        espessura, resistência) e o status de cada lote. Tela de consulta.
      </div>

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
                    <span className={"inline-block rounded-md border px-2 py-0.5 text-xs " + (STATUS_CLASS[e.status] ?? "")}>
                      {STATUS_LABEL[e.status] ?? e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{e._count.amostras}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
