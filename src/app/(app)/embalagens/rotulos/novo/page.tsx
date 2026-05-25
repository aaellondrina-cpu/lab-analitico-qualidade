import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { RotuloForm } from "../_components/RotuloForm";

export default async function NovoRotuloPage() {
  await requireUser();
  const produtos = await prisma.produto.findMany({
    select: { id: true, codigo: true, nome: true }, orderBy: { codigo: "asc" },
  });
  return (
    <>
      <PageHeader title="Novo lote de rótulo" subtitle="Checklist de 24 itens — RDC 259/2002 + Decreto 6.871/2009" />
      <div className="max-w-4xl rounded-lg border border-slate-200 bg-white p-6">
        <RotuloForm produtos={produtos} />
      </div>
    </>
  );
}
