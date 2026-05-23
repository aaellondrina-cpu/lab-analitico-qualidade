import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const STATUS_CLASS: Record<string, string> = {
  PLANEJADA: "bg-slate-100 text-slate-700 border-slate-200",
  EM_ANDAMENTO: "bg-amber-50 text-amber-700 border-amber-200",
  AGUARDANDO_VERIFICACAO: "bg-blue-50 text-blue-700 border-blue-200",
  CONCLUIDA: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_LABEL: Record<string, string> = {
  PLANEJADA: "Planejada",
  EM_ANDAMENTO: "Em andamento",
  AGUARDANDO_VERIFICACAO: "Aguardando verificação",
  CONCLUIDA: "Concluída",
};

const NORMA_LABEL: Record<string, string> = {
  BPF: "BPF",
  ISO_22000: "ISO 22000",
  FSSC_22000: "FSSC 22000",
  ISO_17025: "ISO 17025",
  ANVISA: "ANVISA",
  MAPA: "MAPA",
  INTERNA: "Interna",
};

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function AuditoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; status?: string }>;
}) {
  await requireUser();
  const { tipo, status } = await searchParams;

  const where: Record<string, unknown> = {};
  if (tipo === "INTERNA" || tipo === "EXTERNA") where.tipo = tipo;
  if (status) where.status = status;

  const auditorias = await prisma.auditoria.findMany({
    where,
    orderBy: { dataInicio: "desc" },
    include: { _count: { select: { itens: true } } },
    take: 100,
  });

  return (
    <>
      <PageHeader
        title="Auditorias"
        subtitle="Auditorias formais (BPF, ISO, ANVISA, MAPA) — internas e externas"
        action={
          <Link
            href="/auditorias/nova"
            className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark"
          >
            + Nova auditoria
          </Link>
        }
      />

      {/* Filtros */}
      <form className="mb-4 flex gap-2 text-xs">
        <FilterLink current={tipo} value="" label="Todas" param="tipo" />
        <FilterLink current={tipo} value="INTERNA" label="Internas" param="tipo" />
        <FilterLink current={tipo} value="EXTERNA" label="Externas" param="tipo" />
        <span className="mx-2 text-slate-300">|</span>
        <FilterLink current={status} value="" label="Qualquer status" param="status" />
        <FilterLink current={status} value="PLANEJADA" label="Planejada" param="status" />
        <FilterLink current={status} value="EM_ANDAMENTO" label="Em andamento" param="status" />
        <FilterLink current={status} value="CONCLUIDA" label="Concluída" param="status" />
      </form>

      {auditorias.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhuma auditoria registrada.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Número</th>
                <th className="px-4 py-3 text-left">Tipo / Norma</th>
                <th className="px-4 py-3 text-left">Auditor</th>
                <th className="px-4 py-3 text-left">Início</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Itens</th>
                <th className="px-4 py-3 text-left">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditorias.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link href={`/auditorias/${a.id}`} className="text-petroleo hover:underline">
                      {a.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-medium text-slate-900">
                      {a.tipo === "INTERNA" ? "Interna" : "Externa"}
                    </div>
                    <div className="text-slate-500">
                      {NORMA_LABEL[a.norma] ?? a.norma}
                      {a.orgao && ` · ${a.orgao}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-xs">
                    {a.auditorNome}
                    {a.auditorCredencial && (
                      <div className="text-slate-400">{a.auditorCredencial}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{fmtDate(a.dataInicio)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-block rounded-md border px-2 py-0.5 text-xs " +
                        (STATUS_CLASS[a.status] ?? "")
                      }
                    >
                      {STATUS_LABEL[a.status] ?? a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">{a._count.itens}</td>
                  <td className="px-4 py-3 text-xs">
                    {a.resultado === "APROVADO" && (
                      <span className="text-emerald-700 font-medium">Aprovado</span>
                    )}
                    {a.resultado === "APROVADO_COM_RESSALVAS" && (
                      <span className="text-amber-700 font-medium">C/ ressalvas</span>
                    )}
                    {a.resultado === "REPROVADO" && (
                      <span className="text-red-700 font-medium">Reprovado</span>
                    )}
                    {!a.resultado && <span className="text-slate-400">—</span>}
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

function FilterLink({
  current,
  value,
  label,
  param,
}: {
  current: string | undefined;
  value: string;
  label: string;
  param: string;
}) {
  const href = value ? `/auditorias?${param}=${value}` : `/auditorias`;
  const active = (current ?? "") === value;
  return (
    <Link
      href={href}
      className={
        "rounded-full px-3 py-1 transition-colors " +
        (active ? "bg-petroleo text-white" : "bg-white border border-slate-200 hover:bg-slate-50")
      }
    >
      {label}
    </Link>
  );
}
