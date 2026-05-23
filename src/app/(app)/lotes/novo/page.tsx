import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { LoteForm } from "../_components/LoteForm";

export default async function NovoLotePage() {
  await requireUser();
  const produtos = await prisma.produto.findMany({
    select: { id: true, nome: true, codigo: true, sabor: true },
    orderBy: { nome: "asc" },
  });

  if (produtos.length === 0) {
    return (
      <>
        <PageHeader title="Novo lote" subtitle="Cadastro de lote de produção" />
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Você precisa cadastrar pelo menos um produto antes de criar um lote.{" "}
          <Link href="/produtos/novo" className="underline">Cadastrar produto →</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Novo lote" subtitle="Cadastro de lote de produção" />
      <div className="max-w-3xl rounded-lg border border-slate-200 bg-white p-6">
        <LoteForm produtos={produtos} />
      </div>
    </>
  );
}
