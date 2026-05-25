import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { DeclaracaoForm } from "../_components/DeclaracaoForm";

export default async function NovaDeclaracaoPage() {
  await requireUser();
  const produtos = await prisma.produto.findMany({
    select: { id: true, codigo: true, nome: true },
    orderBy: { codigo: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Nova declaração anual"
        subtitle="Quantidade produzida, vendida e estoque do produto no ano declarado"
      />
      <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <DeclaracaoForm produtos={produtos} />
      </div>
    </>
  );
}
