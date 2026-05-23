import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { InsumoForm } from "../_components/InsumoForm";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function NovoInsumoPage() {
  await requireUser();
  const fornecedores = await prisma.fornecedor.findMany({
    select: { id: true, razaoSocial: true },
    orderBy: { razaoSocial: "asc" },
  });

  return (
    <>
      <PageHeader title="Novo insumo" subtitle="Cadastro de matéria-prima / insumo de produção" />
      <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-6">
        {fornecedores.length === 0 ? (
          <div className="text-sm text-slate-600">
            Cadastre ao menos um{" "}
            <Link href="/fornecedores/novo" className="text-petroleo underline">
              fornecedor
            </Link>{" "}
            antes de adicionar insumos.
          </div>
        ) : (
          <InsumoForm fornecedores={fornecedores} />
        )}
      </div>
    </>
  );
}
