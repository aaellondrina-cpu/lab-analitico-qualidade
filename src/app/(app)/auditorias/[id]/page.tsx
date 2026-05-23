import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { StatusAuditoriaSelect } from "../_components/StatusAuditoriaSelect";
import { ResultadoAuditoriaSelect } from "../_components/ResultadoAuditoriaSelect";
import { AdicionarItemForm } from "../_components/AdicionarItemForm";
import { ExcluirItemButton } from "../_components/ExcluirItemButton";

const NORMA_LABEL: Record<string, string> = {
  BPF: "BPF — Boas Práticas de Fabricação",
  ISO_22000: "ISO 22000",
  FSSC_22000: "FSSC 22000",
  ISO_17025: "ISO/IEC 17025",
  ANVISA: "ANVISA",
  MAPA: "MAPA",
  INTERNA: "Auditoria interna",
};

const RESULTADO_ITEM_CLASS: Record<string, string> = {
  CONFORME: "bg-emerald-50 text-emerald-700 border-emerald-200",
  NAO_CONFORME: "bg-red-50 text-red-700 border-red-200",
  NAO_APLICAVEL: "bg-slate-100 text-slate-600 border-slate-200",
  OBSERVACAO: "bg-amber-50 text-amber-700 border-amber-200",
};

const RESULTADO_ITEM_LABEL: Record<string, string> = {
  CONFORME: "Conforme",
  NAO_CONFORME: "Não conforme",
  NAO_APLICAVEL: "N/A",
  OBSERVACAO: "Observação",
};

function fmtDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function AuditoriaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const auditoria = await prisma.auditoria.findUnique({
    where: { id },
    include: {
      itens: {
        orderBy: { area: "asc" },
        include: { nc: { select: { numero: true, status: true } } },
      },
    },
  });

  if (!auditoria) notFound();

  const areas = auditoria.areas ? auditoria.areas.split(",").filter(Boolean) : [];

  // Agrupa itens por área
  const itensPorArea = new Map<string, typeof auditoria.itens>();
  for (const it of auditoria.itens) {
    const arr = itensPorArea.get(it.area) ?? [];
    arr.push(it);
    itensPorArea.set(it.area, arr);
  }

  const total = auditoria.itens.length;
  const conformes = auditoria.itens.filter((i) => i.resultado === "CONFORME").length;
  const ncs = auditoria.itens.filter((i) => i.resultado === "NAO_CONFORME").length;
  const pct = total > 0 ? (conformes / total) * 100 : 0;

  return (
    <>
      <PageHeader
        title={`Auditoria ${auditoria.numero}`}
        subtitle={`${auditoria.tipo === "INTERNA" ? "Interna" : "Externa"} · ${NORMA_LABEL[auditoria.norma] ?? auditoria.norma}${auditoria.orgao ? ` · ${auditoria.orgao}` : ""}`}
        action={
          <Link href="/auditorias" className="text-sm text-slate-600 hover:underline">
            ← Voltar
          </Link>
        }
      />

      {/* Cabeçalho com dados gerais */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-6">
        <Info k="Auditor" v={auditoria.auditorNome} sub={auditoria.auditorCredencial ?? undefined} />
        <Info k="Início" v={fmtDate(auditoria.dataInicio)} />
        <Info k="Fim" v={fmtDate(auditoria.dataFim)} />
        <Info k="Prazo de resposta" v={fmtDate(auditoria.prazoResposta)} />
      </section>

      {/* Status e resultado */}
      <section className="rounded-lg border border-slate-200 bg-white p-4 mb-6 flex flex-wrap items-center gap-6">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Status</div>
          <StatusAuditoriaSelect id={auditoria.id} current={auditoria.status} />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">Resultado</div>
          <ResultadoAuditoriaSelect id={auditoria.id} current={auditoria.resultado ?? ""} />
        </div>
        <div className="ml-auto text-right">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Conformidade</div>
          <div
            className={
              "text-xl font-semibold " +
              (pct === 100
                ? "text-emerald-700"
                : pct >= 80
                  ? "text-amber-700"
                  : total > 0
                    ? "text-red-700"
                    : "text-slate-400")
            }
          >
            {total > 0 ? `${pct.toFixed(0)}%` : "—"}
          </div>
          <div className="text-xs text-slate-500">
            {conformes} conformes · {ncs} NCs · {total} total
          </div>
        </div>
      </section>

      {auditoria.observacoes && (
        <section className="rounded-md bg-slate-50 border border-slate-200 p-4 mb-6 text-sm text-slate-700">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Observações</div>
          {auditoria.observacoes}
        </section>
      )}

      {/* Adicionar item */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-petroleo mb-2">Adicionar item ao checklist</h2>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <AdicionarItemForm
            auditoriaId={auditoria.id}
            areasSugeridas={areas.length > 0 ? areas : ["Higiene e sanitização"]}
          />
        </div>
      </section>

      {/* Lista de itens agrupados */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-petroleo">Checklist ({total} itens)</h2>
        {total === 0 ? (
          <div className="rounded-md border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
            Nenhum item no checklist ainda.
          </div>
        ) : (
          [...itensPorArea.entries()].map(([area, items]) => (
            <div key={area} className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <header className="bg-slate-50 px-4 py-2 text-xs uppercase tracking-wide text-slate-500">
                {area} <span className="text-slate-400">({items.length})</span>
              </header>
              <ul className="divide-y divide-slate-100">
                {items.map((it) => (
                  <li key={it.id} className="px-4 py-3 flex items-start gap-3 text-sm">
                    <span
                      className={
                        "shrink-0 rounded-md border px-2 py-0.5 text-[11px] " +
                        (RESULTADO_ITEM_CLASS[it.resultado] ?? "")
                      }
                    >
                      {RESULTADO_ITEM_LABEL[it.resultado] ?? it.resultado}
                    </span>
                    <div className="flex-1">
                      <div className="text-slate-900">{it.item}</div>
                      {it.observacao && (
                        <div className="mt-1 text-xs text-slate-600">{it.observacao}</div>
                      )}
                      {it.nc && (
                        <div className="mt-1 text-xs text-red-700">
                          NC vinculada: <span className="font-mono">{it.nc.numero}</span> · {it.nc.status}
                        </div>
                      )}
                    </div>
                    <ExcluirItemButton itemId={it.id} auditoriaId={auditoria.id} />
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      {auditoria.relatorioUrl && (
        <section className="mt-6 rounded-md bg-blue-50 border border-blue-200 px-4 py-3 text-sm">
          <a
            href={auditoria.relatorioUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-700 underline"
          >
            📄 Abrir relatório oficial do órgão (PDF)
          </a>
        </section>
      )}
    </>
  );
}

function Info({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{k}</div>
      <div className="mt-0.5 text-sm text-slate-900">{v}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}
