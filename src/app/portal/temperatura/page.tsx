import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";

const TIPO_LABEL: Record<string, string> = {
  CAMARA_FRIA: "Câmara fria",
  ARMAZEM: "Armazém",
  AREA_PRODUCAO: "Área de produção",
  CAMARA_RETENCAO: "Câmara de retenção",
};

function fmtDateTime(d: Date) {
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function PortalTemperaturaPage() {
  await requireCliente();

  const [pontos, leiturasRecentes] = await Promise.all([
    prisma.pontoTemperatura.findMany({
      where: { ativo: true },
      include: {
        registros: { take: 1, orderBy: { data: "desc" } },
        _count: { select: { registros: { where: { conforme: false } } } },
      },
    }),
    prisma.registroTemperatura.findMany({
      include: { ponto: { select: { nome: true, tempMin: true, tempMax: true } } },
      orderBy: { data: "desc" },
      take: 30,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Controle de Temperatura"
        subtitle="Monitoramento de câmaras frias, armazéns e áreas de produção (Portaria MAPA 1343/2025)"
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você acompanha a temperatura das câmaras e áreas monitoradas,
        com a última leitura e o histórico recente. Tela de consulta.
      </div>

      {pontos.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum ponto de monitoramento cadastrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pontos.map((p) => {
            const ult = p.registros[0];
            const conforme = ult?.conforme ?? null;
            return (
              <div key={p.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">{TIPO_LABEL[p.tipo]}</div>
                <div className="mt-0.5 font-semibold text-slate-900">{p.nome}</div>
                <div className="mt-2 text-xs text-slate-500">
                  Limite: {p.tempMin}°C — {p.tempMax}°C
                </div>
                {ult ? (
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className={"text-2xl font-bold " + (conforme ? "text-emerald-600" : "text-red-600")}>
                        {ult.temperatura.toFixed(1)}°C
                      </div>
                      <div className="text-[10px] text-slate-400">{fmtDateTime(ult.data)}</div>
                    </div>
                    <span className={"rounded-md border px-2 py-1 text-xs " + (conforme ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700")}>
                      {conforme ? "OK" : "DESVIO"}
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-slate-400">Sem leituras ainda</div>
                )}
                {p._count.registros > 0 && (
                  <div className="mt-2 text-[11px] text-amber-700">
                    {p._count.registros} desvios históricos
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {leiturasRecentes.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="px-4 py-3 border-b border-slate-100 text-xs font-medium text-slate-700">Últimas 30 leituras</div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Data/hora</th>
                <th className="px-4 py-2 text-left">Ponto</th>
                <th className="px-4 py-2 text-right">Temp.</th>
                <th className="px-4 py-2 text-left">Limite</th>
                <th className="px-4 py-2 text-left">Resp.</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leiturasRecentes.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-xs text-slate-600">{fmtDateTime(r.data)}</td>
                  <td className="px-4 py-2 text-xs">{r.ponto.nome}</td>
                  <td className={"px-4 py-2 text-right text-xs font-medium " + (r.conforme ? "text-emerald-700" : "text-red-700")}>
                    {r.temperatura.toFixed(1)}°C
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500">{r.ponto.tempMin}–{r.ponto.tempMax}°C</td>
                  <td className="px-4 py-2 text-xs">{r.responsavel}</td>
                  <td className="px-4 py-2 text-xs">
                    {r.conforme ? <span className="text-emerald-700">OK</span> : <span className="text-red-700 font-medium">DESVIO</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
