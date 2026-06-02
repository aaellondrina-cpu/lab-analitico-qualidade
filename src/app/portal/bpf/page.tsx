import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";

const ETAPA_LABEL: Record<string, string> = {
  XAROPE_SIMPLES: "Xarope simples",
  XAROPE_COMPOSTO: "Xarope composto",
  CARBONATACAO: "Carbonatação",
  ENVASE: "Envase",
  HIGIENE: "Higiene pessoal",
  LIMPEZA: "Limpeza/sanitização",
  TEMPERATURA: "Controle de temperatura",
  PRAGAS: "Controle de pragas",
};

function fmtDateTime(d: Date) {
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function BPFPage({
  searchParams,
}: {
  searchParams: Promise<{ etapa?: string }>;
}) {
  await requireCliente();
  const { etapa } = await searchParams;

  const where = etapa ? { etapa } : {};

  const registros = await prisma.registroBPF.findMany({
    where,
    orderBy: { data: "desc" },
    include: { lote: { select: { numero: true } } },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Boas Práticas de Fabricação (BPF)"
        subtitle="Registros de elaboração e controles sanitários — Portaria SDA/MAPA 1343/2025"
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você acompanha os registros de boas práticas de fabricação do laboratório. Use os filtros por etapa para consultar os controles sanitários.
      </div>

      <form className="mb-4 flex flex-wrap gap-2 text-xs">
        <Link href="/portal/bpf" className={"rounded-md border px-3 py-1.5 " + (!etapa ? "border-petroleo bg-petroleo/5 text-petroleo" : "border-slate-200 hover:bg-slate-50")}>
          Todas
        </Link>
        {Object.entries(ETAPA_LABEL).map(([k, label]) => (
          <Link key={k} href={`/portal/bpf?etapa=${k}`}
            className={"rounded-md border px-3 py-1.5 " + (etapa === k ? "border-petroleo bg-petroleo/5 text-petroleo" : "border-slate-200 hover:bg-slate-50")}>
            {label}
          </Link>
        ))}
      </form>

      {registros.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum registro BPF.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Etapa</th>
                <th className="px-4 py-3 text-left">Data/hora</th>
                <th className="px-4 py-3 text-left">Lote</th>
                <th className="px-4 py-3 text-left">Responsável</th>
                <th className="px-4 py-3 text-left">Parâmetros</th>
                <th className="px-4 py-3 text-left">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registros.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs">
                    <span className="inline-block rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5">
                      {ETAPA_LABEL[r.etapa] ?? r.etapa}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{fmtDateTime(r.data)}</td>
                  <td className="px-4 py-3 text-xs font-mono">{r.lote?.numero ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{r.responsavel}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 font-mono max-w-xs truncate" title={r.parametros ?? ""}>
                    {r.parametros ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate" title={r.observacoes ?? ""}>
                    {r.observacoes ?? "—"}
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
