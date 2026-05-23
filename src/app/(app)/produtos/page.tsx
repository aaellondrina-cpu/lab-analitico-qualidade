import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { tipoProdutoLabel } from "@/lib/constants";
import { ExcluirProdutoButton } from "./_components/ExcluirProdutoButton";

export default async function ProdutosPage() {
  await requireUser();
  const produtos = await prisma.produto.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { amostras: true, especificacoes: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Produtos"
        subtitle={`${produtos.length} produto${produtos.length === 1 ? "" : "s"} cadastrado${produtos.length === 1 ? "" : "s"}`}
        action={
          <Link
            href="/produtos/novo"
            className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark"
          >
            + Novo produto
          </Link>
        }
      />

      {produtos.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum produto cadastrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Sabor</th>
                <th className="px-4 py-3 text-right">Parâmetros</th>
                <th className="px-4 py-3 text-right">Amostras</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {produtos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{p.codigo}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{p.nome}</td>
                  <td className="px-4 py-3 text-slate-700">{tipoProdutoLabel(p.tipo)}</td>
                  <td className="px-4 py-3 text-slate-700">{p.sabor ?? <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{p._count.especificacoes}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{p._count.amostras}</td>
                  <td className="px-4 py-3 text-right">
                    <ExcluirProdutoButton id={p.id} disabled={p._count.amostras > 0} />
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
