import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";
import { CLASSIFICACAO_META, NELSON_LABELS } from "@/lib/cep";

function fmt(v: number | null | undefined, casas = 3) {
  if (v === null || v === undefined) return "—";
  return v.toFixed(casas);
}

export default async function PortalCEPPage() {
  await requireCliente();

  const cartas = await prisma.cartaControle.findMany({
    orderBy: [{ classificacao: "asc" }, { parametro: "asc" }],
    include: { produto: { select: { nome: true, codigo: true, sabor: true } } },
  });

  const counts = {
    CAPAZ: cartas.filter((c) => c.classificacao === "CAPAZ").length,
    ATENCAO: cartas.filter((c) => c.classificacao === "ATENCAO").length,
    INCAPAZ: cartas.filter((c) => c.classificacao === "INCAPAZ").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="CEP / SPC"
        subtitle="Controle Estatístico de Processo — cartas Shewhart, Cp/Cpk, Regras de Nelson (últimos 90 dias)"
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você consulta o controle estatístico de processo — capacidade
        (Cp/Cpk) e alertas — que mostra se cada parâmetro está sob controle. Tela de consulta.
      </div>

      <section className="grid grid-cols-3 gap-3">
        <Card label="Capazes (Cpk ≥ 1,33)" value={counts.CAPAZ} tone="emerald" />
        <Card label="Atenção (Cpk 1,00–1,32)" value={counts.ATENCAO} tone="amber" />
        <Card label="Incapazes (Cpk < 1,00)" value={counts.INCAPAZ} tone="red" />
      </section>

      {cartas.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhuma carta calculada ainda.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Produto · Parâmetro</th>
                <th className="px-4 py-3 text-right">n</th>
                <th className="px-4 py-3 text-right">X̄</th>
                <th className="px-4 py-3 text-right">σ</th>
                <th className="px-4 py-3 text-right">LCI · LCS</th>
                <th className="px-4 py-3 text-right">Cp</th>
                <th className="px-4 py-3 text-right">Cpk</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Alertas Nelson</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cartas.map((c) => {
                const meta = CLASSIFICACAO_META[c.classificacao ?? "INSUFICIENTE"];
                const alertas = c.alertasNelson?.split(",").filter(Boolean) ?? [];
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">
                        {c.produto.nome}
                        {c.produto.sabor && <span className="text-slate-500"> · {c.produto.sabor}</span>}
                      </div>
                      <div className="text-[11px] text-slate-500">{c.parametro}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{c.amostras}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-700">{fmt(c.media)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-700">{fmt(c.desvio)}</td>
                    <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-600">
                      {fmt(c.lci)} · {fmt(c.lcs)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-700">{fmt(c.cp, 2)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-semibold">{fmt(c.cpk, 2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] ${meta.color}`}>
                        {meta.icon} {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {alertas.length === 0 ? (
                        <span className="text-[11px] text-slate-400">—</span>
                      ) : (
                        <div className="space-y-0.5">
                          {alertas.map((a) => (
                            <div key={a} className="text-[10px] text-red-700">
                              • {NELSON_LABELS[a] ?? a}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, tone }: { label: string; value: number; tone: "emerald" | "amber" | "red" }) {
  const colors = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };
  return (
    <div className={`rounded-lg border p-4 ${colors[tone]}`}>
      <p className="text-xs uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
