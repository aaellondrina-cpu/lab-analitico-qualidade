import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const STATUS_CLASS: Record<string, string> = {
  PENDENTE: "bg-amber-50 text-amber-700 border-amber-200",
  ENVIADA: "bg-blue-50 text-blue-700 border-blue-200",
  CONFIRMADA: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  ENVIADA: "Enviada",
  CONFIRMADA: "Confirmada pela SFA",
};

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

function fmtNum(n: number) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

export default async function DeclaracaoAnualPage() {
  await requireUser();

  const declaracoes = await prisma.declaracaoAnual.findMany({
    orderBy: [{ ano: "desc" }, { createdAt: "desc" }],
    include: { produto: true },
  });

  return (
    <>
      <PageHeader
        title="Declaração Anual de Produção"
        subtitle="Decreto 6.871/2009 — envio obrigatório ao MAPA até 31/janeiro de cada ano"
        action={
          <Link
            href="/declaracao-anual/nova"
            className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark"
          >
            + Nova declaração
          </Link>
        }
      />

      {declaracoes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhuma declaração registrada.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Ano</th>
                <th className="px-4 py-3 text-left">Produto</th>
                <th className="px-4 py-3 text-right">Produzido</th>
                <th className="px-4 py-3 text-right">Vendido</th>
                <th className="px-4 py-3 text-right">Estoque</th>
                <th className="px-4 py-3 text-left">Un.</th>
                <th className="px-4 py-3 text-left">Envio</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {declaracoes.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{d.ano}</td>
                  <td className="px-4 py-3 text-xs text-slate-700">{d.produto.codigo} — {d.produto.nome}</td>
                  <td className="px-4 py-3 text-right text-xs">{fmtNum(d.qtdProduzida)}</td>
                  <td className="px-4 py-3 text-right text-xs">{fmtNum(d.qtdVendida)}</td>
                  <td className="px-4 py-3 text-right text-xs">{fmtNum(d.estoque)}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{d.unidade}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{fmtDate(d.dataEnvio)}</td>
                  <td className="px-4 py-3">
                    <span className={"inline-block rounded-md border px-2 py-0.5 text-xs " + (STATUS_CLASS[d.status] ?? "")}>
                      {STATUS_LABEL[d.status] ?? d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
