import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";
import { formaTreinamentoLabel } from "@/lib/documento-meta";

function fmtDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

type CellStatus = "TREINADO" | "VENCENDO" | "VENCIDO" | "NAO_TREINADO";

function cellStatus(validade: Date | null, treinado: boolean): CellStatus {
  if (!treinado) return "NAO_TREINADO";
  if (!validade) return "TREINADO";
  const now = Date.now();
  const v = new Date(validade).getTime();
  if (v < now) return "VENCIDO";
  if (v - now < 30 * 24 * 60 * 60 * 1000) return "VENCENDO";
  return "TREINADO";
}

const CELL_CLASS: Record<CellStatus, string> = {
  TREINADO: "bg-emerald-100 text-emerald-800 border-emerald-200",
  VENCENDO: "bg-amber-100 text-amber-800 border-amber-200",
  VENCIDO: "bg-red-100 text-red-800 border-red-200",
  NAO_TREINADO: "bg-slate-50 text-slate-400 border-slate-200",
};

const CELL_LABEL: Record<CellStatus, string> = {
  TREINADO: "✓",
  VENCENDO: "⚠",
  VENCIDO: "✗",
  NAO_TREINADO: "—",
};

export default async function PortalTreinamentosPage() {
  await requireCliente();

  const [colaboradores, documentos, treinamentos] = await Promise.all([
    prisma.colaborador.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
    }),
    prisma.documento.findMany({
      where: { status: "VIGENTE" },
      orderBy: { codigo: "asc" },
    }),
    prisma.treinamento.findMany({
      orderBy: { dataRealizado: "desc" },
      include: {
        colaborador: { select: { nome: true } },
        documento: { select: { codigo: true, titulo: true, versao: true } },
      },
    }),
  ]);

  const matriz = new Map<string, (typeof treinamentos)[number]>();
  for (const t of treinamentos) {
    const key = `${t.colaboradorId}::${t.documentoId}`;
    if (!matriz.has(key)) matriz.set(key, t);
  }

  const totalCells = colaboradores.length * documentos.length;
  let okCount = 0;
  let vencendoCount = 0;
  let vencidoCount = 0;
  let pendenteCount = 0;
  for (const c of colaboradores) {
    for (const d of documentos) {
      const t = matriz.get(`${c.id}::${d.id}`);
      const st = cellStatus(t?.validade ?? null, !!t);
      if (st === "TREINADO") okCount++;
      else if (st === "VENCENDO") vencendoCount++;
      else if (st === "VENCIDO") vencidoCount++;
      else pendenteCount++;
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matriz de Treinamento"
        subtitle="Colaboradores × Documentos vigentes — ISO 17025"
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você consulta a matriz de capacitação da equipe — quem está
        treinado em cada procedimento e a validade de cada treinamento. Tela de consulta.
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card label="Em dia" value={okCount} total={totalCells} tone="emerald" />
        <Card label="Vencendo (30d)" value={vencendoCount} total={totalCells} tone="amber" />
        <Card label="Vencidos" value={vencidoCount} total={totalCells} tone="red" />
        <Card label="Não treinados" value={pendenteCount} total={totalCells} tone="slate" />
      </section>

      <h2 className="text-sm font-semibold text-petroleo">Matriz</h2>
      {colaboradores.length === 0 || documentos.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Sem dados para montar a matriz.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left sticky left-0 bg-slate-50 z-10">Colaborador</th>
                {documentos.map((d) => (
                  <th key={d.id} className="px-2 py-2 text-center min-w-[90px]" title={d.titulo}>
                    <div className="font-mono text-[10px] text-slate-700">{d.codigo}</div>
                    <div className="text-[9px] text-slate-500">v{d.versao}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {colaboradores.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2 sticky left-0 bg-white z-10 border-r border-slate-100">
                    <div className="font-medium text-slate-900">{c.nome}</div>
                    <div className="text-[10px] text-slate-500">{c.cargo}</div>
                  </td>
                  {documentos.map((d) => {
                    const t = matriz.get(`${c.id}::${d.id}`);
                    const st = cellStatus(t?.validade ?? null, !!t);
                    return (
                      <td key={d.id} className="px-1 py-1">
                        <div
                          className={`rounded border text-center text-xs py-1.5 ${CELL_CLASS[st]}`}
                          title={t ? `Treinado em ${fmtDate(t.dataRealizado)}${t.validade ? ` • Válido até ${fmtDate(t.validade)}` : ""}` : "Não treinado"}
                        >
                          <div className="font-semibold">{CELL_LABEL[st]}</div>
                          {t && <div className="text-[9px] opacity-80">{fmtDate(t.validade ?? t.dataRealizado)}</div>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="text-sm font-semibold text-petroleo">Treinamentos recentes</h2>
      {treinamentos.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-400 text-sm">
          Nenhum treinamento registrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Colaborador</th>
                <th className="px-4 py-3 text-left">Documento</th>
                <th className="px-4 py-3 text-left">Instrutor</th>
                <th className="px-4 py-3 text-left">Forma</th>
                <th className="px-4 py-3 text-left">Validade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {treinamentos.slice(0, 30).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-xs">{fmtDate(t.dataRealizado)}</td>
                  <td className="px-4 py-2 text-slate-700">{t.colaborador.nome}</td>
                  <td className="px-4 py-2 text-xs">
                    <span className="font-mono">{t.documento.codigo}</span> v{t.documento.versao}
                    <div className="text-[10px] text-slate-500">{t.documento.titulo}</div>
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-700">{t.instrutor}</td>
                  <td className="px-4 py-2 text-xs text-slate-700">{formaTreinamentoLabel(t.forma)}</td>
                  <td className="px-4 py-2 text-xs">{fmtDate(t.validade)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, total, tone }: { label: string; value: number; total: number; tone: "emerald" | "amber" | "red" | "slate" }) {
  const colors = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
    slate: "border-slate-200 bg-white text-slate-700",
  };
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className={`rounded-lg border p-4 ${colors[tone]}`}>
      <p className="text-xs uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-[10px] opacity-70">{pct}% do total ({total})</p>
    </div>
  );
}
