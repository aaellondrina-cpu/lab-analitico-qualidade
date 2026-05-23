import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const CONCLUSAO_LABEL: Record<string, string> = {
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
  APROVADO_COM_RESTRICOES: "Aprovado c/ restrições",
};

const CONCLUSAO_CLASS: Record<string, string> = {
  APROVADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REPROVADO: "bg-red-50 text-red-700 border-red-200",
  APROVADO_COM_RESTRICOES: "bg-amber-50 text-amber-700 border-amber-200",
};

function fmtDate(d: Date) {
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default async function LaudosPage() {
  await requireUser();
  const laudos = await prisma.laudo.findMany({
    orderBy: { dataEmissao: "desc" },
    include: {
      amostra: {
        select: {
          numeroOS: true,
          cliente: { select: { razaoSocial: true } },
          produto: { select: { nome: true } },
          lote: { select: { numero: true } },
        },
      },
    },
    take: 200,
  });

  return (
    <>
      <PageHeader
        title="Laudos"
        subtitle={`${laudos.length} laudo${laudos.length === 1 ? "" : "s"} emitido${laudos.length === 1 ? "" : "s"}`}
      />

      {laudos.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum laudo emitido ainda. Laudos são gerados a partir de amostras aprovadas.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Número</th>
                <th className="px-4 py-3 text-left">Amostra</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Produto / Lote</th>
                <th className="px-4 py-3 text-left">Conclusão</th>
                <th className="px-4 py-3 text-left">Emissão</th>
                <th className="px-4 py-3 text-left">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {laudos.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link href={`/laudos/${l.id}`} className="text-petroleo hover:underline">
                      {l.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-700 font-mono">{l.amostra.numeroOS}</td>
                  <td className="px-4 py-3 text-slate-700">{l.amostra.cliente.razaoSocial}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <div>{l.amostra.produto.nome}</div>
                    <div className="text-slate-400">Lote {l.amostra.lote.numero}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-block rounded-md border px-2 py-0.5 text-xs " +
                        (CONCLUSAO_CLASS[l.conclusao] ?? "")
                      }
                    >
                      {CONCLUSAO_LABEL[l.conclusao] ?? l.conclusao}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{fmtDate(l.dataEmissao)}</td>
                  <td className="px-4 py-3 text-xs text-slate-700">{l.emitidoPorNome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
