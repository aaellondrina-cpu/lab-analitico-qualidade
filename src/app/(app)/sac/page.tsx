import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const STATUS_CLASS: Record<string, string> = {
  ABERTA: "bg-amber-50 text-amber-700 border-amber-200",
  EM_INVESTIGACAO: "bg-blue-50 text-blue-700 border-blue-200",
  AGUARDANDO_RETORNO: "bg-purple-50 text-purple-700 border-purple-200",
  ENCERRADA: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const URGENCIA_CLASS: Record<string, string> = {
  BAIXA: "text-slate-600",
  MEDIA: "text-blue-700",
  ALTA: "text-amber-700 font-medium",
  CRITICA: "text-red-700 font-semibold",
};

const TIPO_LABEL: Record<string, string> = {
  QUALIDADE: "Qualidade", CORPO_ESTRANHO: "Corpo estranho", EMBALAGEM: "Embalagem",
  VALIDADE: "Validade", ROTULAGEM: "Rotulagem", ATRASO: "Atraso",
  DOCUMENTACAO: "Documentação", OUTRO: "Outro",
};

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

function prazoStatus(prazo: Date) {
  const dias = Math.floor((new Date(prazo).getTime() - Date.now()) / 86400000);
  if (dias < 0) return { label: `Vencido há ${Math.abs(dias)}d`, cls: "text-red-700 font-medium" };
  if (dias <= 1) return { label: `${dias}d restante`, cls: "text-amber-700 font-medium" };
  return { label: `${dias}d`, cls: "text-slate-600" };
}

export default async function SACPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser();
  const { status } = await searchParams;

  const where = status ? { status } : {};
  const sacs = await prisma.sAC.findMany({
    where,
    include: { cliente: { select: { razaoSocial: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <PageHeader
        title="SAC — Reclamações"
        subtitle="Atendimento estruturado a reclamações de clientes com prazo de resposta"
        action={
          <Link href="/sac/nova" className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark">
            + Nova reclamação
          </Link>
        }
      />

      <form className="mb-4 flex flex-wrap gap-2 text-xs">
        <Link href="/sac" className={"rounded-md border px-3 py-1.5 " + (!status ? "border-petroleo bg-petroleo/5 text-petroleo" : "border-slate-200 hover:bg-slate-50")}>
          Todas
        </Link>
        {Object.keys(STATUS_CLASS).map((s) => (
          <Link key={s} href={`/sac?status=${s}`}
            className={"rounded-md border px-3 py-1.5 " + (status === s ? "border-petroleo bg-petroleo/5 text-petroleo" : "border-slate-200 hover:bg-slate-50")}>
            {s.replace(/_/g, " ")}
          </Link>
        ))}
      </form>

      {sacs.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhuma reclamação registrada.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Número</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Urgência</th>
                <th className="px-4 py-3 text-left">Aberta em</th>
                <th className="px-4 py-3 text-left">Prazo</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sacs.map((s) => {
                const ps = prazoStatus(s.prazo);
                return (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">{s.numero}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{s.cliente.razaoSocial}</td>
                    <td className="px-4 py-3 text-xs">{TIPO_LABEL[s.tipo] ?? s.tipo}</td>
                    <td className={"px-4 py-3 text-xs " + (URGENCIA_CLASS[s.urgencia] ?? "")}>{s.urgencia}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{fmtDate(s.createdAt)}</td>
                    <td className={"px-4 py-3 text-xs " + ps.cls}>{ps.label}</td>
                    <td className="px-4 py-3">
                      <span className={"inline-block rounded-md border px-2 py-0.5 text-xs " + (STATUS_CLASS[s.status] ?? "")}>
                        {s.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
