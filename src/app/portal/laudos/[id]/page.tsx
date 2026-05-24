import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { LaudoArticle } from "@/components/LaudoArticle";
import { DownloadLaudoPDF } from "@/components/DownloadLaudoPDF";
import { PrintButton } from "@/app/(app)/laudos/_components/PrintButton";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";
import { getConfiguracao } from "@/lib/configuracao";

async function baseUrl() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function PortalLaudoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireCliente();
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
  // Garante que o cliente só vê os próprios laudos — ataque por adivinhação de ID.
  if (laudo.amostra.clienteId !== user.clienteId) notFound();

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
            <Link
              href="/portal/laudos"
              className="text-sm text-slate-600 hover:underline px-3 py-2"
            >
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
