import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";

const TIPO_LABEL: Record<string, string> = {
  DIARIO: "Diário", MENSAL: "Mensal", SEMESTRAL: "Semestral (completo)",
};
const STATUS_CLASS: Record<string, string> = {
  CONFORME: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ATENCAO: "bg-amber-50 text-amber-700 border-amber-200",
  NAO_CONFORME: "bg-red-50 text-red-700 border-red-200",
};

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function PortalAguaPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  await requireCliente();
  const { tipo } = await searchParams;

  const where = tipo ? { tipo } : {};
  const registros = await prisma.controleAgua.findMany({
    where, orderBy: { data: "desc" }, take: 100,
  });

  const [ultDiario, ultMensal, ultSemestral] = await Promise.all([
    prisma.controleAgua.findFirst({ where: { tipo: "DIARIO" }, orderBy: { data: "desc" } }),
    prisma.controleAgua.findFirst({ where: { tipo: "MENSAL" }, orderBy: { data: "desc" } }),
    prisma.controleAgua.findFirst({ where: { tipo: "SEMESTRAL" }, orderBy: { data: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Água de Processo"
        subtitle="Portaria GM/MS 888/2021 — análises diária, mensal e semestral"
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você acompanha o controle da água de processo (diário, mensal
        e semestral) com o status de cada análise. Tela de consulta.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <CardStatus title="Último controle diário" reg={ultDiario} />
        <CardStatus title="Última análise mensal" reg={ultMensal} />
        <CardStatus title="Última análise semestral" reg={ultSemestral} />
      </div>

      <div className="flex gap-2 text-xs">
        <Link href="/portal/agua-processo" className={"rounded-md border px-3 py-1.5 " + (!tipo ? "border-petroleo bg-petroleo/5 text-petroleo" : "border-slate-200 hover:bg-slate-50")}>
          Todos
        </Link>
        {Object.keys(TIPO_LABEL).map((t) => (
          <Link key={t} href={`/portal/agua-processo?tipo=${t}`}
            className={"rounded-md border px-3 py-1.5 " + (tipo === t ? "border-petroleo bg-petroleo/5 text-petroleo" : "border-slate-200 hover:bg-slate-50")}>
            {TIPO_LABEL[t]}
          </Link>
        ))}
      </div>

      {registros.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum registro de controle de água.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Data</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Ponto</th>
                <th className="px-4 py-2 text-left">Resp.</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Parâmetros</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registros.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-xs">{fmtDate(r.data)}</td>
                  <td className="px-4 py-2 text-xs">{TIPO_LABEL[r.tipo] ?? r.tipo}</td>
                  <td className="px-4 py-2 text-xs">{r.ponto}</td>
                  <td className="px-4 py-2 text-xs">{r.responsavel}</td>
                  <td className="px-4 py-2">
                    <span className={"inline-block rounded-md border px-2 py-0.5 text-xs " + (STATUS_CLASS[r.status] ?? "")}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-600 font-mono max-w-xs truncate" title={r.parametros ?? ""}>
                    {r.parametros ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CardStatus({ title, reg }: { title: string; reg: { status: string; data: Date; ponto: string } | null }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{title}</div>
      {reg ? (
        <>
          <div className="mt-1">
            <span className={"inline-block rounded-md border px-2 py-0.5 text-xs " + (STATUS_CLASS[reg.status] ?? "")}>
              {reg.status.replace(/_/g, " ")}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-600">{reg.ponto}</div>
          <div className="text-[10px] text-slate-400">{fmtDate(reg.data)}</div>
        </>
      ) : (
        <div className="mt-1 text-xs text-slate-400">Sem registros</div>
      )}
    </div>
  );
}
