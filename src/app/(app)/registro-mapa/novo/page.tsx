import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { RegistroMAPAForm } from "../_components/RegistroMAPAForm";

export default async function NovoRegistroMAPAPage() {
  await requireUser();
  const produtos = await prisma.produto.findMany({
    select: { id: true, codigo: true, nome: true },
    orderBy: { codigo: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Novo registro MAPA"
        subtitle="Registro do estabelecimento ou de produto no Ministério da Agricultura"
      />
      <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <RegistroMAPAForm produtos={produtos} />
      </div>
    </>
  );
}
