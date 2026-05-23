import { PageHeader } from "@/components/PageHeader";
import { CIPForm } from "../_components/CIPForm";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function NovoCIPPage() {
  await requireUser();
  const amostras = await prisma.amostra.findMany({
    where: { tipoAnalise: { in: ["CIP", "SWAB", "AR"] } },
    select: { id: true, numeroOS: true, tipoAnalise: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <>
      <PageHeader
        title="Novo registro CIP"
        subtitle="Limpeza e sanitização de tanques, linhas e equipamentos"
      />
      <div className="max-w-xl rounded-lg border border-slate-200 bg-white p-6">
        <CIPForm amostras={amostras} />
      </div>
    </>
  );
}
