import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireCliente } from "@/lib/dal";

const STATUSES = [
  { value: "ABERTA", label: "Aberta", color: "bg-red-100 text-red-700" },
  { value: "EM_TRATAMENTO", label: "Em tratamento", color: "bg-amber-100 text-amber-700" },
  { value: "ENCERRADA", label: "Encerrada", color: "bg-slate-100 text-slate-600" },
];

function fmtDate(d: Date) {
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default async function PortalNaoConformidadesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireCliente();
  const sp = await searchParams;

  const where: { status?: string } = {};
  if (sp.status) where.status = sp.status;

  const ncs = await prisma.naoConformidade.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      amostra: {
        select: {
          numeroOS: true,
          produto: { select: { nome: true } },
          cliente: { select: { razaoSocial: true } },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Não Conformidades"
        subtitle="NCs abertas automaticamente quando resultado fica fora dos limites"
      />

      <div className="rounded-lg border border-agua/30 bg-agua/5 p-4 text-sm text-slate-700">
        💧 <strong>Olá!</strong> Aqui você acompanha as não conformidades registradas, com causa
        raiz e ação corretiva de cada uma. Tela de consulta.
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/portal/nao-conformidades"
          className={"rounded-full px-3 py-1 text-xs " + (!sp.status ? "bg-petroleo text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50")}
        >
          Todas
        </Link>
        {STATUSES.map((s) => {
          const active = sp.status === s.value;
          return (
            <Link
              key={s.value}
              href={`/portal/nao-conformidades?status=${s.value}`}
              className={"rounded-full px-3 py-1 text-xs " + (active ? "bg-petroleo text-white" : `${s.color} hover:opacity-80`)}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {ncs.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhuma não conformidade.
        </div>
      ) : (
        <div className="space-y-3">
          {ncs.map((nc) => {
            const meta = STATUSES.find((s) => s.value === nc.status) ?? STATUSES[0];
            return (
              <article key={nc.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <header className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-mono text-sm font-semibold text-petroleo">{nc.numero}</span>
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${meta.color}`}>{meta.label}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Amostra <span className="font-mono text-petroleo">{nc.amostra.numeroOS}</span>
                  </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                  <div className="lg:col-span-2 space-y-2">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">Parâmetro</div>
                      <div className="text-slate-900 font-medium">{nc.parametro}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">Descrição</div>
                      <div className="text-slate-700">{nc.descricao}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-500">Valor obtido</div>
                        <div className="font-mono">{nc.valorObtido}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-500">Limite</div>
                        <div className="text-slate-700">{nc.limite}</div>
                      </div>
                    </div>
                    {nc.causaRaiz && (
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-500">Causa raiz</div>
                        <div className="text-slate-700">{nc.causaRaiz}</div>
                      </div>
                    )}
                    {nc.acaoCorretiva && (
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-500">Ação corretiva</div>
                        <div className="text-slate-700">{nc.acaoCorretiva}</div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">Produto · Cliente</div>
                      <div className="text-xs text-slate-700">{nc.amostra.produto.nome}</div>
                      <div className="text-[11px] text-slate-500">{nc.amostra.cliente.razaoSocial}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">Responsável</div>
                      <div className="text-xs text-slate-700">{nc.responsavel}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">Prazo</div>
                      <div className="text-xs text-slate-700">{fmtDate(nc.prazo)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-slate-500">Aberta em</div>
                      <div className="text-xs text-slate-700">{fmtDate(nc.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
