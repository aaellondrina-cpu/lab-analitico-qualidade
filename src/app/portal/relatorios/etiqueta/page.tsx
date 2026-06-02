import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function PortalEtiquetaPage({
  searchParams,
}: {
  searchParams: Promise<{ lote?: string }>;
}) {
  await requireCliente();
  const { lote: loteId } = await searchParams;

  const lotes = await prisma.lote.findMany({
    select: { id: true, numero: true, produto: { select: { codigo: true } } },
    orderBy: { createdAt: "desc" }, take: 50,
  });

  const lote = loteId
    ? await prisma.lote.findUnique({
        where: { id: loteId },
        include: { produto: true },
      })
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Etiqueta para impressora inkjet"
        subtitle="Bloco de dados para configurar a impressora jato de tinta da linha de envase"
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700 print:hidden">
        💧 <strong>Olá!</strong> Aqui você gera o bloco LOTE / FAB / VAL / REG. MAPA para configurar
        a impressora da linha. Selecione um lote para visualizar.
      </div>

      <form className="flex gap-2 items-end text-xs print:hidden">
        <div className="flex-1 max-w-md">
          <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Lote</label>
          <select name="lote" defaultValue={loteId ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono">
            <option value="">Selecione...</option>
            {lotes.map((l) => <option key={l.id} value={l.id}>{l.numero}</option>)}
          </select>
        </div>
        <button type="submit" className="rounded-md bg-petroleo px-3 py-2 text-sm font-medium text-white hover:bg-petroleo-dark">
          Gerar
        </button>
      </form>

      {lote ? (
        <div>
          <div className="mx-auto max-w-xl border-2 border-slate-900 bg-white p-6 font-mono text-base">
            <div className="space-y-2">
              <div className="flex">
                <span className="w-32 text-slate-500">LOTE:</span>
                <span className="font-bold text-lg">{lote.numero}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500">FAB:</span>
                <span>{fmtDate(lote.dataInicioProducao)}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500">VAL:</span>
                <span className="font-bold">{fmtDate(lote.dataValidade)}</span>
                {lote.produto.validadeDias && (
                  <span className="ml-2 text-xs text-slate-500">(+{lote.produto.validadeDias}d)</span>
                )}
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500">REG. MAPA:</span>
                <span>{lote.registroMAPAProduto ?? lote.produto.mapaProdutoNumero ?? "—"}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500">PRODUTO:</span>
                <span>{lote.produto.codigo} — {lote.produto.nome}</span>
              </div>
              {lote.linha && (
                <div className="flex">
                  <span className="w-32 text-slate-500">LINHA:</span>
                  <span>{lote.linha}</span>
                </div>
              )}
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500 text-center print:hidden">
            Os campos acima são copiados/configurados na impressora jato de tinta da linha de envase.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Selecione um lote acima para gerar a etiqueta.
        </div>
      )}
    </div>
  );
}
