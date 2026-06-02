import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";

function formatCNPJ(cnpj: string) {
  const digits = cnpj.replace(/\D/g, "").padStart(14, "0");
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

export default async function PortalFornecedoresPage() {
  await requireCliente();
  const fornecedores = await prisma.fornecedor.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { insumos: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fornecedores"
        subtitle={`${fornecedores.length} fornecedor${fornecedores.length === 1 ? "" : "es"} cadastrado${fornecedores.length === 1 ? "" : "s"}`}
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você consulta os fornecedores qualificados que abastecem a
        operação, com seus dados de contato e certificações. Tela de consulta.
      </div>

      {fornecedores.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum fornecedor cadastrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Razão Social</th>
                <th className="px-4 py-3 text-left">CNPJ</th>
                <th className="px-4 py-3 text-left">Responsável</th>
                <th className="px-4 py-3 text-left">Contato</th>
                <th className="px-4 py-3 text-left">Certificações</th>
                <th className="px-4 py-3 text-right">Insumos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fornecedores.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{f.razaoSocial}</td>
                  <td className="px-4 py-3 text-slate-700 font-mono text-xs">{formatCNPJ(f.cnpj)}</td>
                  <td className="px-4 py-3 text-slate-700">{f.responsavel}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{f.email}</div>
                    <div className="text-xs text-slate-400">{f.telefone}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{f.certificacoes ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{f._count.insumos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
