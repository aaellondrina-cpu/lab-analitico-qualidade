import { PageHeader } from "@/components/PageHeader";

export default async function AmostraDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <PageHeader
        title={`Amostra ${id}`}
        subtitle="Detalhe + lançamento de resultados por parâmetro"
      />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-petroleo mb-3">Resultados</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-2">Parâmetro</th>
                <th className="py-2">Valor</th>
                <th className="py-2">Unidade</th>
                <th className="py-2">VMP</th>
                <th className="py-2">Conform.</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Nenhum resultado lançado ainda.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-4 text-sm space-y-2">
          <h2 className="text-sm font-semibold text-petroleo">Dados da amostra</h2>
          <Row k="OS" v={id} />
          <Row k="Cliente" v="—" />
          <Row k="Produto" v="—" />
          <Row k="Lote" v="—" />
          <Row k="Status" v="RECEBIDA" />
          <Row k="Prazo" v="—" />
        </aside>
      </section>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-1">
      <span className="text-slate-500">{k}</span>
      <span className="text-slate-900 font-medium">{v}</span>
    </div>
  );
}
