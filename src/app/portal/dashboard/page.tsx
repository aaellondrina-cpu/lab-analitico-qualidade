import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";

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
  return new Date(d).toLocaleDateString("pt-BR");
}

function daysAgo(n: number) {
  const x = new Date();
  x.setDate(x.getDate() - n);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function PortalDashboardPage() {
  const user = await requireCliente();
  const noventaDias = daysAgo(90);

  const [
    cliente,
    totalAmostras,
    totalLaudos,
    laudosUltimoTrimestre,
    conformidade,
    ultimosLaudos,
  ] = await Promise.all([
    prisma.cliente.findUnique({
      where: { id: user.clienteId },
      select: { razaoSocial: true, responsavel: true, email: true },
    }),
    prisma.amostra.count({ where: { clienteId: user.clienteId } }),
    prisma.laudo.count({ where: { amostra: { clienteId: user.clienteId } } }),
    prisma.laudo.count({
      where: {
        amostra: { clienteId: user.clienteId },
        dataEmissao: { gte: noventaDias },
      },
    }),
    prisma.laudo.groupBy({
      by: ["conclusao"],
      where: { amostra: { clienteId: user.clienteId } },
      _count: { _all: true },
    }),
    prisma.laudo.findMany({
      where: { amostra: { clienteId: user.clienteId } },
      include: {
        amostra: {
          select: {
            numeroOS: true,
            produto: { select: { nome: true } },
            lote: { select: { numero: true } },
          },
        },
      },
      orderBy: { dataEmissao: "desc" },
      take: 5,
    }),
  ]);

  const aprovados = conformidade.find((c) => c.conclusao === "APROVADO")?._count._all ?? 0;
  const pctAprovacao = totalLaudos > 0 ? Math.round((aprovados / totalLaudos) * 100) : 0;

  return (
    <>
      <PageHeader
        title={`Olá, ${cliente?.responsavel ?? user.name}`}
        subtitle={cliente?.razaoSocial ?? undefined}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Amostras" value={totalAmostras} hint="Total no histórico" />
        <KPI label="Laudos emitidos" value={totalLaudos} hint="Disponíveis para download" />
        <KPI label="Últimos 90 dias" value={laudosUltimoTrimestre} hint="Laudos no trimestre" />
        <KPI
          label="Aprovação"
          value={`${pctAprovacao}%`}
          hint={`${aprovados} de ${totalLaudos} aprovado${aprovados === 1 ? "" : "s"}`}
          accent={pctAprovacao >= 90 ? "good" : pctAprovacao >= 70 ? "warn" : "bad"}
        />
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-petroleo">Últimos laudos</h2>
          <Link href="/portal/laudos" className="text-sm text-petroleo hover:underline">
            Ver todos →
          </Link>
        </div>

        {ultimosLaudos.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
            Nenhum laudo emitido para sua empresa ainda.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Laudo</th>
                  <th className="px-4 py-3 text-left">Produto / Lote</th>
                  <th className="px-4 py-3 text-left">Conclusão</th>
                  <th className="px-4 py-3 text-left">Emissão</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ultimosLaudos.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-petroleo">{l.numero}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">
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
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/portal/laudos/${l.id}`}
                        className="text-xs text-petroleo hover:underline"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

type KPIProps = {
  label: string;
  value: number | string;
  hint?: string;
  accent?: "good" | "warn" | "bad";
};

function KPI({ label, value, hint, accent }: KPIProps) {
  const accentClass =
    accent === "good"
      ? "text-emerald-600"
      : accent === "warn"
        ? "text-amber-600"
        : accent === "bad"
          ? "text-red-600"
          : "text-petroleo";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${accentClass}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}
