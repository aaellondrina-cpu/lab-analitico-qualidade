import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const NIVEL_CLASS: Record<string, string> = {
  CLASSE_I: "bg-red-50 text-red-700 border-red-200 font-semibold",
  CLASSE_II: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
  CLASSE_III: "bg-blue-50 text-blue-700 border-blue-200",
};

const NIVEL_LABEL: Record<string, string> = {
  CLASSE_I: "Classe I — risco grave",
  CLASSE_II: "Classe II — risco moderado",
  CLASSE_III: "Classe III — sem risco imediato",
};

const STATUS_CLASS: Record<string, string> = {
  ABERTO: "bg-amber-50 text-amber-700 border-amber-200",
  EM_ANDAMENTO: "bg-blue-50 text-blue-700 border-blue-200",
  ENCERRADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function RecallPage() {
  await requireUser();

  const recalls = await prisma.recall.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { retornos: true } } },
    take: 50,
  });

  return (
    <>
      <PageHeader
        title="Recall — Recolhimento"
        subtitle="Gestão de recolhimento de produto (Decreto 6.871/2009 Art. 80)"
        action={
          <Link href="/recall/novo" className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            + Abrir recall
          </Link>
        }
      />

      {recalls.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum recall registrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Número</th>
                <th className="px-4 py-3 text-left">Identificado</th>
                <th className="px-4 py-3 text-left">Classe</th>
                <th className="px-4 py-3 text-left">Motivo</th>
                <th className="px-4 py-3 text-right">Clientes notif.</th>
                <th className="px-4 py-3 text-left">Resp.</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recalls.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{r.numero}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{fmtDate(r.dataIdentificacao)}</td>
                  <td className="px-4 py-3">
                    <span className={"inline-block rounded-md border px-2 py-0.5 text-xs " + (NIVEL_CLASS[r.nivel] ?? "")}>
                      {NIVEL_LABEL[r.nivel] ?? r.nivel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{r.motivo.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-right text-xs">{r._count.retornos}</td>
                  <td className="px-4 py-3 text-xs">{r.responsavel}</td>
                  <td className="px-4 py-3">
                    <span className={"inline-block rounded-md border px-2 py-0.5 text-xs " + (STATUS_CLASS[r.status] ?? "")}>
                      {r.status}
                    </span>
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
