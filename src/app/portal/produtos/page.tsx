import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";
import { tipoProdutoLabel } from "@/lib/constants";

export default async function ProdutosPage() {
  await requireCliente();
  const produtos = await prisma.produto.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { amostras: true, especificacoes: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        subtitle={`${produtos.length} produto${produtos.length === 1 ? "" : "s"} cadastrado${produtos.length === 1 ? "" : "s"}`}
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você consulta o catálogo de produtos cadastrados. É uma visão somente de leitura — o cadastro e a edição ficam com o laboratório.
      </div>

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
