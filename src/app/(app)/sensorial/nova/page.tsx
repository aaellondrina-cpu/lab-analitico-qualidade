import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { SensorialForm } from "../_components/SensorialForm";

export default async function NovaSensorialPage() {
  await requireUser();
  const lotes = await prisma.lote.findMany({
    select: { id: true, numero: true, produto: { select: { codigo: true } } },
    orderBy: { createdAt: "desc" }, take: 100,
  });
  return (
    <>
      <PageHeader title="Nova avaliação sensorial" subtitle="Ficha hedônica 1-9 por avaliador" />
      <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <SensorialForm lotes={lotes} />
      </div>
    </>
  );
}
