import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const STATUS_CLASS: Record<string, string> = {
  EM_ANALISE: "bg-amber-50 text-amber-700 border-amber-200",
  APROVADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  APROVADO_COM_RESSALVA: "bg-yellow-50 text-yellow-700 border-yellow-200",
  REPROVADO: "bg-red-50 text-red-700 border-red-200",
};

function fmtDate(d: Date) { return new Date(d).toLocaleDateString("pt-BR"); }

export default async function RotulosPage() {
  await requireUser();

  const rotulos = await prisma.rotulo.findMany({
    include: { produto: { select: { codigo: true, nome: true } } },
    orderBy: { dataRecebimento: "desc" },
    take: 100,
  });

  return (
    <>
      <PageHeader
        title="Rótulos — Checklist RDC 259/2002"
        subtitle="Conformidade obrigatória de rotulagem para indústria de bebidas"
        action={
          <div className="flex gap-2">
            <Link href="/embalagens" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50">
              ← Embalagens
            </Link>
            <Link href="/embalagens/rotulos/novo" className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark">
              + Novo lote de rótulo
            </Link>
          </div>
        }
      />

      {rotulos.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum lote de rótulo registrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Recebido</th>
                <th className="px-4 py-3 text-left">Produto</th>
                <th className="px-4 py-3 text-left">Fornecedor</th>
                <th className="px-4 py-3 text-left">Lote forn.</th>
                <th className="px-4 py-3 text-right">Qtd</th>
                <th className="px-4 py-3 text-left">NF</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rotulos.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs">{fmtDate(r.dataRecebimento)}</td>
                  <td className="px-4 py-3 text-xs">{r.produto.codigo}</td>
                  <td className="px-4 py-3 text-xs">{r.fornecedor}</td>
                  <td className="px-4 py-3 text-xs font-mono">{r.loteFornecedor}</td>
                  <td className="px-4 py-3 text-right text-xs">{r.quantidade}</td>
                  <td className="px-4 py-3 text-xs">{r.numeroNF ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={"inline-block rounded-md border px-2 py-0.5 text-xs " + (STATUS_CLASS[r.status] ?? "")}>
                      {r.status.replace(/_/g, " ")}
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
