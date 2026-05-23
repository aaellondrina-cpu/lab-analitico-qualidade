import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { EquipamentoForm } from "./_components/EquipamentoForm";
import { ExcluirEquipamentoButton, RecalcularButton } from "./_components/ExcluirEquipamentoButton";

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR");
}

const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  CALIBRADO: { label: "Calibrado", color: "bg-emerald-100 text-emerald-700", icon: "✓" },
  PROXIMO_VENCIMENTO: { label: "Próximo vencimento", color: "bg-amber-100 text-amber-700", icon: "⚠" },
  VENCIDO: { label: "Vencido", color: "bg-red-100 text-red-700", icon: "✗" },
};

function diasAte(d: Date) {
  const now = Date.now();
  const diff = new Date(d).getTime() - now;
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export default async function EquipamentosPage() {
  await requireUser();
  const equipamentos = await prisma.equipamento.findMany({
    orderBy: [{ proximaCalibracao: "asc" }],
    include: { _count: { select: { resultados: true } } },
  });

  const counts = {
    CALIBRADO: equipamentos.filter((e) => e.status === "CALIBRADO").length,
    PROXIMO_VENCIMENTO: equipamentos.filter((e) => e.status === "PROXIMO_VENCIMENTO").length,
    VENCIDO: equipamentos.filter((e) => e.status === "VENCIDO").length,
  };

  return (
    <>
      <PageHeader
        title="Equipamentos"
        subtitle={`${equipamentos.length} equipamento(s) · ${counts.VENCIDO} vencido(s) · ${counts.PROXIMO_VENCIMENTO} próximos do vencimento`}
        action={<RecalcularButton />}
      />

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-petroleo mb-3">Novo equipamento</h2>
        <EquipamentoForm />
      </section>

      {equipamentos.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum equipamento cadastrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Modelo / Série</th>
                <th className="px-4 py-3">Última calibração</th>
                <th className="px-4 py-3">Próxima calibração</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Usos</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipamentos.map((e) => {
                const meta = STATUS_META[e.status] ?? STATUS_META.CALIBRADO;
                const dias = diasAte(e.proximaCalibracao);
                return (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{e.nome}</div>
                      {e.fabricante && <div className="text-[11px] text-slate-500">{e.fabricante}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div>{e.modelo}</div>
                      <div className="font-mono text-slate-500">{e.numeroSerie}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">{fmtDate(e.ultimaCalibracao)}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-700">{fmtDate(e.proximaCalibracao)}</div>
                      <div className="text-[10px] text-slate-500">
                        {dias < 0 ? `vencida há ${-dias} dia(s)` : dias === 0 ? "vence hoje" : `em ${dias} dia(s)`}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${meta.color}`}>{meta.icon} {meta.label}</span>
                      {e.certificadoUrl && (
                        <a href={e.certificadoUrl} target="_blank" rel="noreferrer" className="block mt-1 text-[10px] text-petroleo hover:underline">
                          Ver certificado ↗
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{e._count.resultados}</td>
                    <td className="px-4 py-3 text-right">
                      <ExcluirEquipamentoButton id={e.id} />
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
