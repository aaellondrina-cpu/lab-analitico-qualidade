import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

function daysAgo(n: number) {
  const x = new Date();
  x.setDate(x.getDate() - n);
  x.setHours(0, 0, 0, 0);
  return x;
}

function monthLabel(d: Date) {
  return d.toLocaleString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");
}

function pct(num: number, den: number) {
  if (den === 0) return 0;
  return Math.round((num / den) * 1000) / 10;
}

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function IndicadoresPage() {
  await requireUser();

  const trintaDias = daysAgo(30);
  const seisMesesAtras = daysAgo(180);
  const inicioAno = new Date(new Date().getFullYear(), 0, 1);
  const proximosTrintaDias = new Date();
  proximosTrintaDias.setDate(proximosTrintaDias.getDate() + 30);

  const [
    lotesUltimo30,
    ncsAbertas,
    ncsEncerradas30d,
    equipamentosVencidos,
    equipamentosProximoVencer,
    laudosEmitidos30d,
    resultadosConformidade30d,
    ncsPorParametro,
    aguaConformidade,
    auditoriasAno,
    lotes6meses,
    sacsAbertos,
    recallsAndamento,
    treinamentosVencidos,
  ] = await Promise.all([
    prisma.lote.findMany({
      where: { dataInicioProducao: { gte: trintaDias } },
      select: { status: true },
    }),
    prisma.naoConformidade.count({
      where: { status: { in: ["ABERTA", "EM_TRATAMENTO"] } },
    }),
    prisma.naoConformidade.count({
      where: { status: "ENCERRADA", updatedAt: { gte: trintaDias } },
    }),
    prisma.equipamento.count({ where: { status: "VENCIDO" } }),
    prisma.equipamento.findMany({
      where: {
        proximaCalibracao: { gte: new Date(), lte: proximosTrintaDias },
        status: { not: "VENCIDO" },
      },
      orderBy: { proximaCalibracao: "asc" },
      select: { id: true, nome: true, numeroSerie: true, proximaCalibracao: true, status: true },
      take: 5,
    }),
    prisma.laudo.count({ where: { createdAt: { gte: trintaDias } } }),
    prisma.resultado.groupBy({
      by: ["conformidade"],
      where: { dataEnsaio: { gte: trintaDias } },
      _count: { _all: true },
    }),
    prisma.naoConformidade.groupBy({
      by: ["parametro"],
      where: { createdAt: { gte: trintaDias } },
      _count: { _all: true },
      orderBy: { _count: { parametro: "desc" } },
      take: 5,
    }),
    prisma.controleAgua.groupBy({
      by: ["tipo", "status"],
      where: { data: { gte: trintaDias } },
      _count: { _all: true },
    }),
    prisma.auditoria.findMany({
      where: { dataInicio: { gte: inicioAno } },
      orderBy: { dataInicio: "desc" },
      select: { id: true, tipo: true, norma: true, dataInicio: true, resultado: true, areas: true },
      take: 8,
    }),
    prisma.lote.findMany({
      where: { dataInicioProducao: { gte: seisMesesAtras } },
      select: { dataInicioProducao: true, status: true },
    }),
    prisma.sAC.count({ where: { status: { in: ["ABERTA", "EM_INVESTIGACAO"] } } }),
    prisma.recall.count({ where: { status: { in: ["INICIADO", "EM_ANDAMENTO"] } } }),
    prisma.colaborador.count({
      where: { proximoExame: { lte: proximosTrintaDias } },
    }),
  ]);

  // === Cálculos derivados ===

  const lotesAprovados = lotesUltimo30.filter((l) => l.status === "APROVADO" || l.status === "LIBERADO").length;
  const lotesReprovados = lotesUltimo30.filter((l) => l.status === "REPROVADO" || l.status === "DESCARTADO").length;
  const totalLotesUltimo30 = lotesUltimo30.length;
  const taxaAprovacaoLotes = pct(lotesAprovados, lotesAprovados + lotesReprovados);

  const conformeCount = resultadosConformidade30d.find((r) => r.conformidade === "CONFORME")?._count._all ?? 0;
  const naoConformeCount =
    (resultadosConformidade30d.find((r) => r.conformidade === "NAO_CONFORME")?._count._all ?? 0) +
    (resultadosConformidade30d.find((r) => r.conformidade === "INCONCLUSIVO")?._count._all ?? 0);
  const totalResultados30d = conformeCount + naoConformeCount;
  const taxaConformidadeAnalises = pct(conformeCount, totalResultados30d);

  // Evolução mensal de aprovação (6 meses)
  const meses: { label: string; aprovados: number; reprovados: number; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const inicio = new Date();
    inicio.setMonth(inicio.getMonth() - i, 1);
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(inicio);
    fim.setMonth(fim.getMonth() + 1);
    const noMes = lotes6meses.filter((l) => {
      if (!l.dataInicioProducao) return false;
      const d = new Date(l.dataInicioProducao);
      return d >= inicio && d < fim;
    });
    const apr = noMes.filter((l) => l.status === "APROVADO" || l.status === "LIBERADO").length;
    const rep = noMes.filter((l) => l.status === "REPROVADO" || l.status === "DESCARTADO").length;
    meses.push({ label: monthLabel(inicio), aprovados: apr, reprovados: rep, total: apr + rep });
  }
  const maxLotesMes = Math.max(1, ...meses.map((m) => m.total));

  const maxNcParam = Math.max(1, ...ncsPorParametro.map((n) => n._count._all));

  return (
    <>
      <PageHeader
        title="Indicadores da Qualidade"
        subtitle="KPIs e tendências — ISO/IEC 17025 item 8.9 (Análise crítica pela direção)"
      />

      {/* Linha 1 — KPIs principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Taxa de aprovação de lotes"
          value={`${taxaAprovacaoLotes}%`}
          hint={`${lotesAprovados} aprovados · ${lotesReprovados} reprovados · 30d`}
          tone={taxaAprovacaoLotes >= 95 ? "good" : taxaAprovacaoLotes >= 85 ? "warn" : "bad"}
        />
        <KPICard
          label="Conformidade analítica"
          value={`${taxaConformidadeAnalises}%`}
          hint={`${conformeCount} conformes · ${naoConformeCount} NC · 30d`}
          tone={taxaConformidadeAnalises >= 98 ? "good" : taxaConformidadeAnalises >= 92 ? "warn" : "bad"}
        />
        <KPICard
          label="NCs abertas"
          value={ncsAbertas}
          hint={`${ncsEncerradas30d} encerradas nos últimos 30d`}
          tone={ncsAbertas === 0 ? "good" : ncsAbertas <= 5 ? "warn" : "bad"}
        />
        <KPICard
          label="Laudos emitidos"
          value={laudosEmitidos30d}
          hint="Últimos 30 dias"
          tone="info"
        />
      </div>

      {/* Linha 2 — Alertas operacionais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICardSmall label="Equip. com calibração vencida" value={equipamentosVencidos} tone={equipamentosVencidos > 0 ? "bad" : "good"} />
        <KPICardSmall label="Equip. vencendo em 30d" value={equipamentosProximoVencer.length} tone={equipamentosProximoVencer.length > 0 ? "warn" : "good"} />
        <KPICardSmall label="SACs em aberto" value={sacsAbertos} tone={sacsAbertos > 0 ? "warn" : "good"} />
        <KPICardSmall label="Recalls em andamento" value={recallsAndamento} tone={recallsAndamento > 0 ? "bad" : "good"} />
      </div>

      {/* Linha 3 — Gráfico de evolução */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 mb-6">
        <h2 className="text-sm font-semibold text-petroleo mb-1">Lotes por mês — últimos 6 meses</h2>
        <p className="text-xs text-slate-500 mb-4">Aprovados (verde) vs Reprovados (vermelho)</p>
        <div className="grid grid-cols-6 gap-3 items-end h-44">
          {meses.map((m) => {
            const totalH = (m.total / maxLotesMes) * 100;
            const aprPct = m.total ? (m.aprovados / m.total) * 100 : 0;
            return (
              <div key={m.label} className="flex flex-col items-center justify-end h-full">
                <div className="w-full flex flex-col-reverse items-stretch" style={{ height: `${Math.max(totalH, 4)}%` }}>
                  {m.aprovados > 0 && (
                    <div
                      className="bg-emerald-500 rounded-t-sm w-full transition-all"
                      style={{ height: `${aprPct}%` }}
                      title={`${m.aprovados} aprovados`}
                    />
                  )}
                  {m.reprovados > 0 && (
                    <div
                      className="bg-red-500 w-full transition-all"
                      style={{ height: `${100 - aprPct}%` }}
                      title={`${m.reprovados} reprovados`}
                    />
                  )}
                  {m.total === 0 && <div className="bg-slate-100 w-full h-full" />}
                </div>
                <div className="mt-2 text-[11px] text-slate-600 font-mono">{m.total}</div>
                <div className="text-[11px] text-slate-500">{m.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Linha 4 — 2 colunas: NCs por parâmetro + Água */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-petroleo mb-1">Top parâmetros com mais NC</h2>
          <p className="text-xs text-slate-500 mb-4">Últimos 30 dias · ordenado por frequência</p>
          {ncsPorParametro.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">
              Sem não conformidades nos últimos 30 dias. ✓
            </p>
          ) : (
            <ul className="space-y-2">
              {ncsPorParametro.map((n) => {
                const w = (n._count._all / maxNcParam) * 100;
                return (
                  <li key={n.parametro} className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-700">{n.parametro}</span>
                      <span className="text-slate-500 font-mono">{n._count._all}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${w}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-petroleo mb-1">Controle de água — Portaria 888/2021</h2>
          <p className="text-xs text-slate-500 mb-4">Conformidade por tipo de controle · 30d</p>
          {aguaConformidade.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">
              Nenhum controle de água registrado nos últimos 30d.
            </p>
          ) : (
            <ul className="space-y-3">
              {(["DIARIO", "MENSAL", "SEMESTRAL"] as const).map((tipo) => {
                const conf = aguaConformidade.find((a) => a.tipo === tipo && a.status === "CONFORME")?._count._all ?? 0;
                const naoConf = aguaConformidade.find((a) => a.tipo === tipo && a.status === "NAO_CONFORME")?._count._all ?? 0;
                const total = conf + naoConf;
                const pctC = total ? (conf / total) * 100 : 0;
                const label = { DIARIO: "Diário", MENSAL: "Mensal", SEMESTRAL: "Semestral" }[tipo];
                return (
                  <li key={tipo} className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-700">{label}</span>
                      <span className="text-slate-500">
                        {conf}/{total} conformes
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-red-200 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${pctC}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Linha 5 — 2 colunas: Equipamentos vencendo + Auditorias do ano */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-petroleo mb-1">Equipamentos — calibração vencendo</h2>
          <p className="text-xs text-slate-500 mb-4">Próximos 30 dias</p>
          {equipamentosProximoVencer.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-6">
              Nenhum equipamento com calibração vencendo. ✓
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {equipamentosProximoVencer.map((e) => (
                <li key={e.id} className="py-2 flex justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-800">{e.nome}</div>
                    <div className="text-slate-500 font-mono">{e.numeroSerie}</div>
                  </div>
                  <div className="text-amber-700 text-right">
                    <div>Vence em</div>
                    <div className="font-mono">{fmtDate(e.proximaCalibracao)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-petroleo mb-1">Auditorias do ano</h2>
          <p className="text-xs text-slate-500 mb-4">
            Total: {auditoriasAno.length} · {treinamentosVencidos > 0 ? `⚠ ${treinamentosVencidos} exame(s) ocupacional vencendo` : "Exames ocupacionais em dia"}
          </p>
          {auditoriasAno.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-6">
              Nenhuma auditoria registrada este ano.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {auditoriasAno.map((a) => (
                <li key={a.id} className="py-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{a.tipo} · {a.norma}</div>
                      <div className="text-slate-500 truncate">{a.areas || "—"}</div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="text-slate-700 font-mono">{fmtDate(a.dataInicio)}</div>
                      <div className="text-slate-500">{a.resultado ?? "—"}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function KPICard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone: "good" | "warn" | "bad" | "info";
}) {
  const colors = {
    good: "border-emerald-200 bg-emerald-50",
    warn: "border-amber-200 bg-amber-50",
    bad: "border-red-200 bg-red-50",
    info: "border-slate-200 bg-white",
  }[tone];
  const valueColor = {
    good: "text-emerald-700",
    warn: "text-amber-700",
    bad: "text-red-700",
    info: "text-petroleo",
  }[tone];
  return (
    <div className={`rounded-lg border ${colors} px-4 py-3`}>
      <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${valueColor}`}>{value}</div>
      {hint && <div className="mt-1 text-[11px] text-slate-500">{hint}</div>}
    </div>
  );
}

function KPICardSmall({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "good" | "warn" | "bad";
}) {
  const colors = {
    good: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warn: "border-amber-200 bg-amber-50 text-amber-700",
    bad: "border-red-200 bg-red-50 text-red-700",
  }[tone];
  return (
    <div className={`rounded-lg border ${colors} px-3 py-2`}>
      <div className="text-[10px] uppercase tracking-wide opacity-80 font-medium leading-tight">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
