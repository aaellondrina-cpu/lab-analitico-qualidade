import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { SACForm } from "../_components/SACForm";

export default async function NovaSACPage() {
  await requireUser();
  const clientes = await prisma.cliente.findMany({
    select: { id: true, razaoSocial: true, cnpj: true },
    orderBy: { razaoSocial: "asc" },
  });

  return (
    <>
      <PageHeader title="Nova reclamação SAC" subtitle="Registrar contato do cliente" />
      <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <SACForm clientes={clientes} />
      </div>
    </>
  );
}
