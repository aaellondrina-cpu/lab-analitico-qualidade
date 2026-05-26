import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { DeleteButton } from "@/components/DeleteButton";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { statusLote } from "@/lib/constants";
import { LoteStatusActions } from "./_components/LoteStatusActions";
import { ProdutoFilter } from "./_components/ProdutoFilter";
import { excluirLote } from "./actions";

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default async function LotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; produto?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  const where: { status?: string; produtoId?: string } = {};
  if (sp.status) where.status = sp.status;
  if (sp.produto) where.produtoId = sp.produto;

  const [lotes, produtos] = await Promise.all([
    prisma.lote.findMany({
      where,
      orderBy: { dataInicioProducao: "desc" },
      include: {
        produto: { select: { nome: true, codigo: true } },
        _count: { select: { amostras: true } },
      },
    }),
    prisma.produto.findMany({ select: { id: true, nome: true, codigo: true }, orderBy: { nome: "asc" } }),
  ]);

  const STATUSES = ["EM_PRODUCAO", "FINALIZADO", "LIBERADO", "RETIDO", "DESCARTADO"];

  return (
    <>
      <PageHeader
        title="Lotes de Produção"
        subtitle={`${lotes.length} lote${lotes.length === 1 ? "" : "s"} ${sp.status ? "filtrado" + (lotes.length === 1 ? "" : "s") : ""}`}
        action={
          <Link
            href="/lotes/novo"
            className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark"
          >
            + Novo lote
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href="/lotes"
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
              href={`/lotes?status=${s}`}
              className={
                "rounded-full px-3 py-1 text-xs " +
                (active ? "bg-petroleo text-white" : `${meta.color} hover:opacity-80`)
              }
            >
              {meta.label}
            </Link>
          );
        })}
        {produtos.length > 0 && <ProdutoFilter produtos={produtos} />}
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
                <th className="px-4 py-3 text-right">Ações</th>
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
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/lotes/${l.id}/editar`}
                          className="text-xs text-petroleo hover:underline"
                        >
                          Editar
                        </Link>
                        <LoteStatusActions id={l.id} status={l.status} />
                        {(user.role === "ADMIN" || user.role === "RESPONSAVEL_TECNICO") && (
                          <DeleteButton
                            onConfirm={excluirLote.bind(null, l.id)}
                            label="Excluir"
                            size="sm"
                            confirmText={`Excluir o lote ${l.numero}?`}
                          />
                        )}
                      </div>
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
