import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { ClienteForm } from "../../_components/ClienteForm";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente) notFound();

  return (
    <>
      <PageHeader title="Editar cliente" subtitle={cliente.razaoSocial} />
      <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-6">
        <ClienteForm
          initial={{
            id: cliente.id,
            razaoSocial: cliente.razaoSocial,
            cnpj: cliente.cnpj,
            responsavel: cliente.responsavel,
            email: cliente.email,
            telefone: cliente.telefone,
          }}
        />
      </div>
    </>
  );
}
