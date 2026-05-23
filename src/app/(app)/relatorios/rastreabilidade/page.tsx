import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

export default async function BuscarLotePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireUser();
  const { q } = await searchParams;

  const lotes = q
    ? await prisma.lote.findMany({
        where: {
          OR: [
            { numero: { contains: q } },
            { produto: { nome: { contains: q } } },
          ],
        },
        include: { produto: { select: { nome: true } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      })
    : await prisma.lote.findMany({
        include: { produto: { select: { nome: true } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      });

  return (
    <>
      <PageHeader
        title="Rastreabilidade por lote"
        subtitle="Escolha um lote para gerar o relatório completo"
        action={
          <Link href="/relatorios" className="text-sm text-slate-600 hover:underline">
            ← Relatórios
          </Link>
        }
      />

      <form className="mb-4 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por número de lote ou produto…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agua"
        />
        <button
          type="submit"
          className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark"
        >
          Buscar
        </button>
      </form>

      {lotes.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum lote encontrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Lote</th>
                <th className="px-4 py-2 text-left">Produto</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Início</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lotes.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-mono">{l.numero}</td>
                  <td className="px-4 py-2 text-slate-700">{l.produto.nome}</td>
                  <td className="px-4 py-2 text-xs text-slate-600">{l.status}</td>
                  <td className="px-4 py-2 text-xs text-slate-600">
                    {new Date(l.dataInicioProducao).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      href={`/relatorios/rastreabilidade/${l.id}`}
                      className="text-xs text-petroleo hover:underline"
                    >
                      Gerar relatório →
                    </Link>
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
