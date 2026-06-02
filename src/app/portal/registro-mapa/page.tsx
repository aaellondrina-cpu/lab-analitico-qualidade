import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

function statusValidade(validade: Date | null) {
  if (!validade) return { label: "Indeterminada", cls: "bg-slate-100 text-slate-600" };
  const dias = Math.floor((new Date(validade).getTime() - Date.now()) / 86400000);
  if (dias < 0) return { label: "Vencido", cls: "bg-red-50 text-red-700 border-red-200" };
  if (dias <= 60) return { label: `Vence em ${dias}d`, cls: "bg-amber-50 text-amber-700 border-amber-200" };
  return { label: "Vigente", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
}

export default async function PortalRegistroMAPAPage() {
  await requireCliente();

  const [registros, produtos] = await Promise.all([
    prisma.registroMAPA.findMany({ orderBy: { dataConcessao: "desc" } }),
    prisma.produto.findMany({ select: { id: true, codigo: true, nome: true } }),
  ]);

  const produtoNome = new Map(produtos.map((p) => [p.id, `${p.codigo} — ${p.nome}`]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registro MAPA"
        subtitle="Registros do estabelecimento e dos produtos no Ministério da Agricultura (Decreto 6.871/2009)"
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você consulta os registros do estabelecimento e dos produtos
        no MAPA, com validade e situação de cada um. Tela de consulta.
      </div>

      {registros.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum registro MAPA cadastrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Número</th>
                <th className="px-4 py-3 text-left">Produto</th>
                <th className="px-4 py-3 text-left">Concessão</th>
                <th className="px-4 py-3 text-left">Validade</th>
                <th className="px-4 py-3 text-left">SFA</th>
                <th className="px-4 py-3 text-left">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registros.map((r) => {
                const sv = statusValidade(r.validade);
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs">
                      {r.tipo === "ESTABELECIMENTO" ? "Estabelecimento" : "Produto"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.numero}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {r.produtoId ? (produtoNome.get(r.produtoId) ?? "—") : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{fmtDate(r.dataConcessao)}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{fmtDate(r.validade)}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">{r.sfaEstado ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={"inline-block rounded-md border px-2 py-0.5 text-xs " + sv.cls}>
                        {sv.label}
                      </span>
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
