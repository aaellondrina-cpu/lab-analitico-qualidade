import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { RecallForm } from "../_components/RecallForm";

export default async function NovoRecallPage() {
  await requireUser();
  const lotes = await prisma.lote.findMany({
    select: { id: true, numero: true, produto: { select: { codigo: true, nome: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <PageHeader title="Abrir recall" subtitle="Inicia o processo de recolhimento de produto" />
      <div className="max-w-2xl rounded-lg border border-red-200 bg-white p-6">
        <p className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          ⚠️ Atenção: recall é uma ação obrigatória de comunicação ao MAPA. Confirme o problema antes de prosseguir.
        </p>
        <RecallForm lotes={lotes} />
      </div>
    </>
  );
}
