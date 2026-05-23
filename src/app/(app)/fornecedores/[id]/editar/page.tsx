import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { FornecedorForm } from "../../_components/FornecedorForm";

export default async function EditarFornecedorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const f = await prisma.fornecedor.findUnique({ where: { id } });
  if (!f) notFound();

  return (
    <>
      <PageHeader title="Editar fornecedor" subtitle={f.razaoSocial} />
      <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-6">
        <FornecedorForm
          initial={{
            id: f.id,
            razaoSocial: f.razaoSocial,
            cnpj: f.cnpj,
            responsavel: f.responsavel,
            email: f.email,
            telefone: f.telefone,
            endereco: f.endereco,
            certificacoes: f.certificacoes,
          }}
        />
      </div>
    </>
  );
}
