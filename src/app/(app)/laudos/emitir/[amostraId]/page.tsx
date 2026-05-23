import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { EmitirLaudoForm } from "../../_components/EmitirLaudoForm";

export default async function EmitirLaudoPage({
  params,
}: {
  params: Promise<{ amostraId: string }>;
}) {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "RESPONSAVEL_TECNICO") {
    redirect("/amostras");
  }

  const { amostraId } = await params;

  const amostra = await prisma.amostra.findUnique({
    where: { id: amostraId },
    include: {
      cliente: { select: { razaoSocial: true } },
      produto: { select: { nome: true } },
      lote: { select: { numero: true } },
      resultados: { select: { conformidade: true } },
      laudo: { select: { id: true, numero: true } },
    },
  });

  if (!amostra) notFound();
  if (amostra.laudo) {
    redirect(`/laudos/${amostra.laudo.id}`);
  }

  const ncs = amostra.resultados.filter((r) => r.conformidade === "NAO_CONFORME").length;
  const atencoes = amostra.resultados.filter((r) => r.conformidade === "ATENCAO").length;
  const sugestao =
    ncs > 0 ? "REPROVADO" : atencoes > 0 ? "APROVADO_COM_RESTRICOES" : "APROVADO";

  return (
    <>
      <PageHeader
        title="Emitir laudo"
        subtitle={`Amostra ${amostra.numeroOS} · ${amostra.produto.nome} · Lote ${amostra.lote.numero}`}
        action={
          <Link href={`/amostras/${amostra.id}`} className="text-sm text-slate-600 hover:underline">
            ← Voltar
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4 text-sm text-slate-700">
            <p className="mb-2">
              Cliente: <strong>{amostra.cliente.razaoSocial}</strong>
            </p>
            <p>
              {amostra.resultados.length} resultado(s) · {ncs} não-conforme(s) ·{" "}
              {atencoes} em atenção
            </p>
          </div>

          <EmitirLaudoForm amostraId={amostra.id} sugestao={sugestao} />
        </div>

        <aside className="text-sm text-slate-600 space-y-2">
          <h3 className="font-semibold text-slate-700">Atenção</h3>
          <p>O laudo é assinado digitalmente com seu nome e cargo, recebe número sequencial L-{new Date().getFullYear()}-XXXX e fica registrado na trilha de auditoria.</p>
          <p>Cada laudo gera um QR Code para verificação pública de autenticidade.</p>
          <p>A amostra será marcada como <strong>LAUDO_EMITIDO</strong> e não poderá ter novos resultados lançados.</p>
        </aside>
      </div>
    </>
  );
}
