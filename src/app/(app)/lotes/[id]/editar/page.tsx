import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { LoteForm } from "../../_components/LoteForm";

export default async function EditarLotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const [lote, produtos] = await Promise.all([
    prisma.lote.findUnique({ where: { id } }),
    prisma.produto.findMany({
      select: { id: true, nome: true, codigo: true, sabor: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  if (!lote) notFound();

  return (
    <>
      <PageHeader title={`Editar lote ${lote.numero}`} subtitle="Atualize dados da produção" />
      <div className="max-w-3xl rounded-lg border border-slate-200 bg-white p-6">
        <LoteForm
          produtos={produtos}
          initial={{
            id: lote.id,
            numero: lote.numero,
            produtoId: lote.produtoId,
            sabor: lote.sabor,
            dataInicioProducao: lote.dataInicioProducao,
            dataFimProducao: lote.dataFimProducao,
            volumeTotal: lote.volumeTotal,
            unidadesProduzidas: lote.unidadesProduzidas,
            linha: lote.linha,
            turno: lote.turno,
            responsavelProducao: lote.responsavelProducao,
            observacoes: lote.observacoes,
          }}
        />
      </div>
    </>
  );
}
