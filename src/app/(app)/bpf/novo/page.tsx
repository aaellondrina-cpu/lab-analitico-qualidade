import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { BPFForm } from "../_components/BPFForm";

export default async function NovoBPFPage() {
  await requireUser();
  const lotes = await prisma.lote.findMany({
    select: { id: true, numero: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <PageHeader
        title="Novo registro BPF"
        subtitle="Registrar etapa de elaboração, controle sanitário ou monitoramento"
      />
      <div className="max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
        <BPFForm lotes={lotes} />
      </div>
    </>
  );
}
