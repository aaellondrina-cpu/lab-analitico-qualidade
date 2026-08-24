import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { statusAmostra, STATUS_AMOSTRA, tipoAnaliseLabel } from "@/lib/constants";

function fmtDate(d: Date) {
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function prazoStatus(prazo: Date): { label: string; color: string } {
  const now = Date.now();
  const diff = new Date(prazo).getTime() - now;
  const hours = diff / (1000 * 60 * 60);
  if (diff < 0) return { label: "Vencido", color: "text-red-600 font-medium" };
  if (hours < 24) return { label: "< 24h", color: "text-amber-600 font-medium" };
  return { label: fmtDate(prazo), color: "text-slate-600" };
}

export default async function AmostrasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;

  const where: { status?: string } = {};
  if (sp.status) where.status = sp.status;

  const [amostras, totalPorStatus] = await Promise.all([
    prisma.amostra.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        cliente: { select: { razaoSocial: true } },
        produto: { select: { nome: true, codigo: true } },
        lote: { select: { numero: true, sabor: true } },
        _count: { select: { resultados: true, ncs: true } },
      },
    }),
    prisma.amostra.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const contadores = new Map<string, number>();
  contadores.set("TODOS", 0);
  totalPorStatus.forEach((s) => contadores.set(s.status, s._count._all));
  const totalGeral = Array.from(contadores.values()).reduce((a, b) => a + b, 0);
  contadores.set("TODOS", totalGeral);

  return (
    <>
      <PageHeader
        title="Amostras"
        subtitle={`${amostras.length} amostra${amostras.length === 1 ? "" : "s"}${sp.status ? ` · ${statusAmostra(sp.status).label}` : ""}`}
        action={
          <Link href="/amostras/nova" className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark">
            + Nova amostra
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href="/amostras"
          className={"rounded-full px-3 py-1 text-xs " + (!sp.status ? "bg-petroleo text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50")}
        >
          Todas ({contadores.get("TODOS") || 0})
        </Link>
        {STATUS_AMOSTRA.map((s) => {
          const active = sp.status === s.value;
          const count = contadores.get(s.value) || 0;
          return (
            <Link
              key={s.value}
              href={`/amostras?status=${s.value}`}
              className={"rounded-full px-3 py-1 text-xs " + (active ? "bg-petroleo text-white" : `${s.color} hover:opacity-80`)}
            >
              {s.label} ({count})
            </Link>
          );
        })}
      </div>

      {amostras.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhuma amostra registrada.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">OS</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Produto / Lote</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Resultados</th>
                <th className="px-4 py-3 text-right">NCs</th>
                <th className="px-4 py-3">Prazo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {amostras.map((a) => {
                const s = statusAmostra(a.status);
                const prazo = prazoStatus(a.prazoEntrega);
                return (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">
                      <Link href={`/amostras/${a.id}`} className="text-petroleo hover:underline font-medium">
                        {a.numeroOS}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{a.cliente.razaoSocial}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{a.produto.nome}</div>
                      <div className="text-xs text-slate-500 font-mono">{a.lote.numero}{a.lote.sabor ? ` · ${a.lote.sabor}` : ""}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-xs">{tipoAnaliseLabel(a.tipoAnalise)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{a._count.resultados}</td>
                    <td className={`px-4 py-3 text-right ${a._count.ncs > 0 ? "text-red-600 font-medium" : "text-slate-400"}`}>{a._count.ncs}</td>
                    <td className={`px-4 py-3 text-xs ${prazo.color}`}>{prazo.label}</td>
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
