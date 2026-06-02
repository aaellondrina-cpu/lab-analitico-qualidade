import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";

function fmtDate(d: Date) {
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

const STATUS_CLASS: Record<string, string> = {
  APROVADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REPROCESSAR: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABEL: Record<string, string> = {
  APROVADO: "Aprovado",
  REPROCESSAR: "Reprocessar",
};

export default async function PortalCIPPage() {
  await requireCliente();
  const registros = await prisma.registroCIP.findMany({
    orderBy: { data: "desc" },
    include: { amostra: { select: { numeroOS: true } } },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registros CIP"
        subtitle="Clean-In-Place — limpeza e sanitização de tanques, linhas e enchedoras"
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você consulta os ciclos de limpeza CIP (concentração,
        temperatura e tempo) e o resultado de cada um. Tela de consulta.
      </div>

      {registros.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum registro CIP ainda.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Alvo</th>
                <th className="px-4 py-3 text-left">Responsável</th>
                <th className="px-4 py-3 text-right">Conc. (%)</th>
                <th className="px-4 py-3 text-right">Temp. (°C)</th>
                <th className="px-4 py-3 text-right">Tempo (min)</th>
                <th className="px-4 py-3 text-left">Amostra</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registros.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-xs text-slate-600">{fmtDate(r.data)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{r.alvo}</td>
                  <td className="px-4 py-3 text-slate-700">{r.responsavel}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{r.concentracao}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{r.temperatura}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{r.tempoContatoMin}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                    {r.amostra?.numeroOS ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-block rounded-md border px-2 py-0.5 text-xs " +
                        (STATUS_CLASS[r.status] ?? "")
                      }
                    >
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
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
