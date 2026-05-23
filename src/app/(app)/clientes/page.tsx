import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { ExcluirClienteButton } from "./_components/ExcluirClienteButton";

function formatCNPJ(cnpj: string) {
  const digits = cnpj.replace(/\D/g, "").padStart(14, "0");
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

export default async function ClientesPage() {
  await requireUser();
  const clientes = await prisma.cliente.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { amostras: true } } },
  });

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle={`${clientes.length} indústria${clientes.length === 1 ? "" : "s"} atendida${clientes.length === 1 ? "" : "s"}`}
        action={
          <Link
            href="/clientes/novo"
            className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark"
          >
            + Novo cliente
          </Link>
        }
      />

      {clientes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum cliente cadastrado.
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
                <th className="px-4 py-3 text-right">Amostras</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.razaoSocial}</td>
                  <td className="px-4 py-3 text-slate-700 font-mono text-xs">{formatCNPJ(c.cnpj)}</td>
                  <td className="px-4 py-3 text-slate-700">{c.responsavel}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{c.email}</div>
                    <div className="text-xs text-slate-400">{c.telefone}</div>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{c._count.amostras}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/clientes/${c.id}/editar`}
                        className="text-xs text-petroleo hover:underline"
                      >
                        Editar
                      </Link>
                      <ExcluirClienteButton id={c.id} disabled={c._count.amostras > 0} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
