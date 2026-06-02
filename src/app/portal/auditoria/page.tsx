import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";
import { ROLE_LABEL } from "@/lib/constants";

function fmtDate(d: Date) {
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });
}

function actionMeta(a: string): { color: string; icon: string } {
  switch (a) {
    case "CREATE": return { color: "bg-emerald-100 text-emerald-700", icon: "+" };
    case "UPDATE": return { color: "bg-blue-100 text-blue-700", icon: "✎" };
    case "DELETE": return { color: "bg-red-100 text-red-700", icon: "−" };
    case "APPROVE":
    case "SIGN": return { color: "bg-cyan-100 text-cyan-700", icon: "✓" };
    default: return { color: "bg-slate-100 text-slate-700", icon: "·" };
  }
}

export default async function PortalAuditoriaPage() {
  await requireCliente();

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.auditLog.count(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trilha de Auditoria"
        subtitle={`Registro de alterações do sistema · ${total} registro${total === 1 ? "" : "s"} (ISO 17025 §7.5)`}
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Esta é a trilha de auditoria — o registro automático de tudo que
        acontece no sistema (quem fez, quando e o quê). Não pode ser editada. Tela de consulta.
      </div>

      {logs.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum registro de auditoria.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Data/hora</th>
                <th className="px-4 py-2">Usuário</th>
                <th className="px-4 py-2">Ação</th>
                <th className="px-4 py-2">Entidade</th>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => {
                const meta = actionMeta(l.action);
                return (
                  <tr key={l.id} className="hover:bg-slate-50 align-top">
                    <td className="px-4 py-2 text-xs text-slate-600 whitespace-nowrap font-mono">{fmtDate(l.createdAt)}</td>
                    <td className="px-4 py-2 text-xs">
                      <div className="font-medium text-slate-800">{l.userName ?? "—"}</div>
                      <div className="text-[10px] text-slate-500">{ROLE_LABEL[l.userRole ?? ""] ?? l.userRole ?? ""}</div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${meta.color}`}>{meta.icon} {l.action}</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-700">{l.entity}</td>
                    <td className="px-4 py-2 text-[10px] font-mono text-slate-500 truncate max-w-[140px]">{l.entityId ?? "—"}</td>
                    <td className="px-4 py-2 text-[11px] text-slate-600 font-mono break-all max-w-md">
                      {l.diff ? <pre className="whitespace-pre-wrap">{l.diff}</pre> : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {total > 200 && (
            <div className="px-4 py-2 text-xs text-slate-500 bg-slate-50 border-t border-slate-200">
              Exibindo os 200 registros mais recentes.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
