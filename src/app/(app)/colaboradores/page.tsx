import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { ColaboradorForm } from "./_components/ColaboradorForm";
import { ColaboradorActions } from "./_components/ColaboradorActions";

export default async function ColaboradoresPage() {
  await requireUser();

  const colaboradores = await prisma.colaborador.findMany({
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    include: { _count: { select: { treinamentos: true } } },
  });

  return (
    <>
      <PageHeader
        title="Colaboradores"
        subtitle="Cadastro de pessoas para a matriz de treinamento (ISO 17025)"
        action={
          <Link href="/treinamentos" className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Matriz de treinamento →
          </Link>
        }
      />

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-petroleo mb-3">Novo colaborador</h2>
        <ColaboradorForm />
      </section>

      {colaboradores.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum colaborador cadastrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Cargo</th>
                <th className="px-4 py-3 text-left">Setor</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-right">Treinamentos</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {colaboradores.map((c) => (
                <tr key={c.id} className={c.ativo ? "hover:bg-slate-50" : "opacity-60"}>
                  <td className="px-4 py-3 font-medium text-slate-900">{c.nome}</td>
                  <td className="px-4 py-3 text-slate-700">{c.cargo}</td>
                  <td className="px-4 py-3 text-slate-700">{c.setor}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{c._count.treinamentos}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[11px] " +
                        (c.ativo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")
                      }
                    >
                      {c.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ColaboradorActions id={c.id} ativo={c.ativo} />
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
