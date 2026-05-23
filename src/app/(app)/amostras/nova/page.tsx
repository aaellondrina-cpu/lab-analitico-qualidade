import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { AmostraForm } from "../_components/AmostraForm";

export default async function NovaAmostraPage() {
  await requireUser();

  const [clientes, produtos, lotes, pontos] = await Promise.all([
    prisma.cliente.findMany({ select: { id: true, razaoSocial: true }, orderBy: { razaoSocial: "asc" } }),
    prisma.produto.findMany({ select: { id: true, codigo: true, nome: true }, orderBy: { nome: "asc" } }),
    prisma.lote.findMany({
      select: { id: true, numero: true, produtoId: true, sabor: true, status: true },
      where: { status: { in: ["EM_PRODUCAO", "FINALIZADO", "LIBERADO"] } },
      orderBy: { dataInicioProducao: "desc" },
    }),
    prisma.pontoColeta.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Nova amostra" subtitle="Registrar entrada de amostra no laboratório" />
      <div className="max-w-4xl rounded-lg border border-slate-200 bg-white p-6">
        <AmostraForm clientes={clientes} produtos={produtos} lotes={lotes} pontos={pontos} />
      </div>
    </>
  );
}
