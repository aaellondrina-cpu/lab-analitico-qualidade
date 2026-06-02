import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { ExcluirInsumoButton } from "./_components/ExcluirInsumoButton";

const TIPO_LABEL: Record<string, string> = {
  AGUA: "Água",
  ACUCAR: "Açúcar",
  HFCS: "HFCS",
  CO2: "CO₂",
  CONCENTRADO: "Concentrado",
  ESSENCIA: "Essência",
  EDULCORANTE: "Edulcorante",
  ACIDULANTE: "Acidulante",
  CONSERVANTE: "Conservante",
  CORANTE: "Corante",
  OUTRO: "Outro",
};

function fmtBRL(v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function InsumosPage() {
  await requireUser();
  const insumos = await prisma.insumo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      fornecedor: { select: { razaoSocial: true } },
      lotes: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          precoUnitario: true,
          valorTotal: true,
          quantidade: true,
          unidade: true,
          numeroNF: true,
          condicaoPagamento: true,
        },
      },
      _count: { select: { lotes: true } },
    },
  });

  const totalValor = insumos.reduce((acc, i) => acc + (i.lotes[0]?.valorTotal ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Insumos e matérias-primas"
        subtitle={`${insumos.length} insumo${insumos.length === 1 ? "" : "s"} · valor do último lote: ${fmtBRL(totalValor)}`}
        action={
          <Link
            href="/insumos/novo"
            className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark"
          >
            + Novo insumo
          </Link>
        }
      />

      {insumos.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum insumo cadastrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Fornecedor</th>
                <th className="px-4 py-3 text-right">Preço unit.</th>
                <th className="px-4 py-3 text-right">Qtde</th>
                <th className="px-4 py-3 text-right">Valor total</th>
                <th className="px-4 py-3 text-left">NF</th>
                <th className="px-4 py-3 text-left">Pagto</th>
                <th className="px-4 py-3 text-right">Lotes</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {insumos.map((i) => {
                const ultimo = i.lotes[0];
                return (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{i.codigo}</td>
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/insumos/${i.id}`} className="text-petroleo hover:underline">
                        {i.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{TIPO_LABEL[i.tipo] ?? i.tipo}</td>
                    <td className="px-4 py-3 text-slate-600">{i.fornecedor.razaoSocial}</td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {fmtBRL(ultimo?.precoUnitario)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {ultimo?.quantidade ? `${ultimo.quantidade} ${ultimo.unidade ?? ""}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-petroleo">
                      {fmtBRL(ultimo?.valorTotal)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{ultimo?.numeroNF ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{ultimo?.condicaoPagamento ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{i._count.lotes}</td>
                    <td className="px-4 py-3 text-right">
                      <ExcluirInsumoButton id={i.id} disabled={i._count.lotes > 0} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
