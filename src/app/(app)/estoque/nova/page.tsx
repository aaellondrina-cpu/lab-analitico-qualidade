import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { EstoqueForm } from "../_components/EstoqueForm";

export default async function NovaMovEstoquePage() {
  await requireUser();
  const [lotes, clientes] = await Promise.all([
    prisma.lote.findMany({
      select: { id: true, numero: true, produto: { select: { codigo: true } } },
      orderBy: { createdAt: "desc" }, take: 100,
    }),
    prisma.cliente.findMany({ select: { id: true, razaoSocial: true }, orderBy: { razaoSocial: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Nova movimentação" subtitle="Registrar entrada ou saída de lote no estoque" />
      <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <EstoqueForm lotes={lotes} clientes={clientes} />
      </div>
    </>
  );
}
