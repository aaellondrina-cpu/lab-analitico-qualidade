import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { LaudoArticle } from "@/components/LaudoArticle";
import { DownloadLaudoPDF } from "@/components/DownloadLaudoPDF";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { getConfiguracao } from "@/lib/configuracao";
import { PrintButton } from "../_components/PrintButton";

async function baseUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function LaudoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const laudo = await prisma.laudo.findUnique({
    where: { id },
    include: {
      amostra: {
        include: {
          cliente: true,
          produto: { include: { especificacoes: true } },
          lote: true,
          pontoColeta: true,
          resultados: { orderBy: { dataEnsaio: "asc" } },
        },
      },
    },
  });

  if (!laudo) notFound();

  const config = await getConfiguracao();
  const base = await baseUrl();
  const verifyUrl = `${base}/verificar/${laudo.qrToken}`;

  return (
    <>
      <PageHeader
        title={`Laudo ${laudo.numero}`}
        subtitle={`Amostra ${laudo.amostra.numeroOS} · ${laudo.amostra.produto.nome}`}
        action={
          <div className="flex gap-2 print:hidden">
            <Link href="/laudos" className="text-sm text-slate-600 hover:underline px-3 py-2">
              ← Voltar
            </Link>
            <DownloadLaudoPDF numeroLaudo={laudo.numero} />
            <PrintButton />
          </div>
        }
      />

      <LaudoArticle laudo={laudo} config={config} verifyUrl={verifyUrl} />
    </>
  );
}
