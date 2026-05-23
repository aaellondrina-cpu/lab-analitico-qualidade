import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { ROLE_LABEL } from "@/lib/constants";

const ENTIDADES = ["Cliente", "Produto", "Lote", "Amostra", "Resultado", "NaoConformidade", "Laudo", "Equipamento", "PontoColeta", "User"];
const ACOES = ["CREATE", "UPDATE", "DELETE", "SIGN", "APPROVE", "LOGIN", "LOGOUT"];

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

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; action?: string; user?: string }>;
}) {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "RESPONSAVEL_TECNICO") {
    return (
      <>
        <PageHeader title="Auditoria" subtitle="Trilha de auditoria (MAPA / ISO 17025)" />
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Acesso restrito a Administradores e Responsáveis Técnicos.
        </div>
      </>
    );
  }

  const sp = await searchParams;
  const where: { entity?: string; action?: string; userName?: { contains: string } } = {};
  if (sp.entity) where.entity = sp.entity;
  if (sp.action) where.action = sp.action;
  if (sp.user) where.userName = { contains: sp.user };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return (
    <>
      <PageHeader
        title="Auditoria"
        subtitle={`Trilha de auditoria · ${total} registro${total === 1 ? "" : "s"} ${Object.keys(where).length > 0 ? "(filtrado)" : ""}`}
      />

      <form className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
        <select name="entity" defaultValue={sp.entity ?? ""} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Todas as entidades</option>
          {ENTIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <select name="action" defaultValue={sp.action ?? ""} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Todas as ações</option>
          {ACOES.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input
          name="user"
          defaultValue={sp.user ?? ""}
          placeholder="Usuário (nome ou e-mail)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <button type="submit" className="flex-1 rounded-md bg-petroleo px-4 py-2 text-sm text-white hover:bg-petroleo-dark">Filtrar</button>
          <Link href="/auditoria" className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Limpar</Link>
        </div>
      </form>

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
              Exibindo os 200 registros mais recentes. Use os filtros para refinar.
            </div>
          )}
        </div>
      )}
    </>
  );
}
