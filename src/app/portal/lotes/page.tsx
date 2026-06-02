import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";
import { statusLote } from "@/lib/constants";

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default async function PortalLotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireCliente();
  const sp = await searchParams;

  const where: { status?: string } = {};
  if (sp.status) where.status = sp.status;

  const lotes = await prisma.lote.findMany({
    where,
    orderBy: { dataInicioProducao: "desc" },
    include: {
      produto: { select: { nome: true, codigo: true } },
      _count: { select: { amostras: true } },
    },
  });

  const STATUSES = ["EM_PRODUCAO", "FINALIZADO", "LIBERADO", "RETIDO", "DESCARTADO"];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lotes de Produção"
        subtitle={`${lotes.length} lote${lotes.length === 1 ? "" : "s"} ${sp.status ? "filtrado" + (lotes.length === 1 ? "" : "s") : ""}`}
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você acompanha os lotes de produção e o status de cada um, com
        rastreabilidade até as amostras analisadas. Tela de consulta.
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/portal/lotes"
          className={
            "rounded-full px-3 py-1 text-xs " +
            (!sp.status ? "bg-petroleo text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50")
          }
        >
          Todos
        </Link>
        {STATUSES.map((s) => {
          const meta = statusLote(s);
          const active = sp.status === s;
          return (
            <Link
              key={s}
              href={`/portal/lotes?status=${s}`}
              className={
                "rounded-full px-3 py-1 text-xs " +
                (active ? "bg-petroleo text-white" : `${meta.color} hover:opacity-80`)
              }
            >
              {meta.label}
            </Link>
          );
        })}
      </div>

      {lotes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum lote cadastrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Número</th>
                <th className="px-4 py-3 text-left">Produto / Sabor</th>
                <th className="px-4 py-3 text-left">Produção</th>
                <th className="px-4 py-3 text-left">Volume</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Amostras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lotes.map((l) => {
                const s = statusLote(l.status);
                return (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{l.numero}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{l.produto.nome}</div>
                      <div className="text-xs text-slate-500">
                        {l.produto.codigo}{l.sabor ? ` · ${l.sabor}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div>Início: {fmtDate(l.dataInicioProducao)}</div>
                      <div>Fim: {fmtDate(l.dataFimProducao)}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{l.volumeTotal ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{l._count.amostras}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
