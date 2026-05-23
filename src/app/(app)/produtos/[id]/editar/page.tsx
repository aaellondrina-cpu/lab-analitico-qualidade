import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { ProdutoEditForm } from "../../_components/ProdutoEditForm";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const p = await prisma.produto.findUnique({
    where: { id },
    include: { _count: { select: { especificacoes: true } } },
  });
  if (!p) notFound();

  return (
    <>
      <PageHeader
        title="Editar produto"
        subtitle={`${p.codigo} · ${p.nome}${p.sabor ? ` · ${p.sabor}` : ""} · ${p._count.especificacoes} parâmetro(s)`}
      />
      <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <ProdutoEditForm
          initial={{
            id: p.id,
            nome: p.nome,
            codigo: p.codigo,
            tipo: p.tipo,
            sabor: p.sabor,
          }}
        />
      </div>
    </>
  );
}
