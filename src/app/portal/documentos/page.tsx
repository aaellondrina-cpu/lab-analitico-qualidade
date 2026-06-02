import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";
import { STATUS_DOCUMENTO_META, tipoDocumentoLabel } from "@/lib/documento-meta";

function fmtDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

function diasAte(d: Date | null) {
  if (!d) return null;
  const now = Date.now();
  return Math.round((new Date(d).getTime() - now) / (1000 * 60 * 60 * 24));
}

function isVencida(d: Date | null) {
  if (!d) return false;
  return new Date(d).getTime() < Date.now();
}

export default async function PortalDocumentosPage() {
  await requireCliente();

  const documentos = await prisma.documento.findMany({
    orderBy: [{ status: "asc" }, { codigo: "asc" }],
    include: { _count: { select: { treinamentos: true } } },
  });

  const vigentes = documentos.filter((d) => d.status === "VIGENTE");
  const obsoletos = documentos.filter((d) => d.status === "OBSOLETO").length;
  const emRevisao = documentos.filter((d) => d.status === "EM_REVISAO").length;
  const revisaoVencida = documentos.filter((d) => d.status === "VIGENTE" && isVencida(d.revisaoEm)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        subtitle="Controle de versões de POPs, ITPs, manuais e procedimentos (ISO 17025 / ISO 22000)"
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você acompanha os documentos da qualidade — POPs, manuais e
        procedimentos — com versão vigente e data de revisão. Tela de consulta.
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card label="Vigentes" value={vigentes.length} tone="emerald" />
        <Card label="Em revisão" value={emRevisao} tone="amber" />
        <Card label="Revisão vencida" value={revisaoVencida} tone={revisaoVencida > 0 ? "red" : "slate"} />
        <Card label="Obsoletos" value={obsoletos} tone="slate" />
      </section>

      {documentos.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhum documento cadastrado.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Código · v</th>
                <th className="px-4 py-3 text-left">Título</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Aprovação</th>
                <th className="px-4 py-3 text-left">Próx. revisão</th>
                <th className="px-4 py-3 text-right">Treinos</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documentos.map((d) => {
                const statusMeta = STATUS_DOCUMENTO_META[d.status] ?? STATUS_DOCUMENTO_META.VIGENTE;
                const dias = diasAte(d.revisaoEm);
                const vencida = d.status === "VIGENTE" && dias !== null && dias < 0;
                return (
                  <tr key={d.id} className={vencida ? "bg-red-50" : "hover:bg-slate-50"}>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-slate-700">{d.codigo}</div>
                      <div className="text-[11px] text-slate-500">v{d.versao}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-900">
                      {d.titulo}
                      {d.arquivoUrl && (
                        <a href={d.arquivoUrl} target="_blank" rel="noreferrer" className="ml-2 text-[10px] text-petroleo hover:underline">
                          PDF ↗
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{tipoDocumentoLabel(d.tipo)}</td>
                    <td className="px-4 py-3 text-xs">
                      <div>{fmtDate(d.dataAprovacao)}</div>
                      <div className="text-[10px] text-slate-500">{d.aprovadoPor}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {d.revisaoEm ? (
                        <>
                          <div className={vencida ? "text-red-700 font-medium" : "text-slate-700"}>{fmtDate(d.revisaoEm)}</div>
                          <div className="text-[10px] text-slate-500">
                            {dias !== null && (dias < 0 ? `vencida há ${-dias}d` : `em ${dias}d`)}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{d._count.treinamentos}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-md border px-2 py-0.5 text-[11px] ${statusMeta.color}`}>
                        {statusMeta.label}
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

function Card({ label, value, tone }: { label: string; value: number; tone: "emerald" | "amber" | "red" | "slate" }) {
  const colors = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
    slate: "border-slate-200 bg-white text-slate-700",
  };
  return (
    <div className={`rounded-lg border p-4 ${colors[tone]}`}>
      <p className="text-xs uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}
