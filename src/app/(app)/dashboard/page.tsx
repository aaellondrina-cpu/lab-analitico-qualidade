import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { statusAmostra } from "@/lib/constants";
import { CONFORMIDADE_META, type Conformidade } from "@/lib/conformidade";

function inicioDoDia(d: Date = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const x = new Date();
  x.setDate(x.getDate() - n);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysFromNow(n: number) {
  return new Date(new Date().getTime() + n * 24 * 60 * 60 * 1000);
}

export default async function DashboardPage() {
  const user = await requireUser();
  const hoje = inicioDoDia();
  const em24h = daysFromNow(1);
  const trintaDiasAtras = daysAgo(30);

  const [
    recebidasHoje,
    emAnalise,
    aguardandoAprovacao,
    ncsAbertas,
    amostrasPrazoVencendo,
    equipamentosVencidos,
    ultimasAmostras,
    conformidade30d,
    ncsRecentes,
    totalProdutos,
    totalLotesAtivos,
    totalInsumos,
    totalFornecedores,
    totalClientes,
    ultimosProdutos,
    processosIncapazes,
    documentosRevisaoVencida,
    treinamentosVencidos,
    pccsForaLimite,
  ] = await Promise.all([
    prisma.amostra.count({ where: { dataRecebimento: { gte: hoje } } }),
    prisma.amostra.count({ where: { status: "EM_ANALISE" } }),
    prisma.amostra.count({ where: { status: "AGUARDANDO_APROVACAO" } }),
    prisma.naoConformidade.count({ where: { status: { in: ["ABERTA", "EM_TRATAMENTO"] } } }),
    prisma.amostra.findMany({
      where: {
        prazoEntrega: { lte: em24h },
        status: { notIn: ["APROVADO", "LAUDO_EMITIDO"] },
      },
      include: { cliente: { select: { razaoSocial: true } }, produto: { select: { nome: true } } },
      orderBy: { prazoEntrega: "asc" },
      take: 5,
    }),
    prisma.equipamento.count({ where: { status: "VENCIDO" } }),
    prisma.amostra.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        cliente: { select: { razaoSocial: true } },
        produto: { select: { nome: true } },
      },
    }),
    prisma.resultado.groupBy({
      by: ["conformidade"],
      where: { dataEnsaio: { gte: trintaDiasAtras } },
      _count: { _all: true },
    }),
    prisma.naoConformidade.findMany({
      where: { status: { in: ["ABERTA", "EM_TRATAMENTO"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { amostra: { select: { numeroOS: true } } },
    }),
    prisma.produto.count(),
    prisma.lote.count({ where: { status: { in: ["EM_PRODUCAO", "FINALIZADO", "AGUARDANDO_ANALISE"] } } }),
    prisma.insumo.count(),
    prisma.fornecedor.count(),
    prisma.cliente.count(),
    prisma.produto.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { especificacoes: true, lotes: true } } },
    }),
    prisma.cartaControle.count({ where: { classificacao: "INCAPAZ" } }),
    prisma.documento.count({ where: { status: "VIGENTE", revisaoEm: { lt: daysFromNow(0) } } }),
    prisma.treinamento.count({ where: { status: "VENCIDO" } }),
    prisma.monitoramentoPCC.count({
      where: {
        conforme: false,
        data: { gte: daysAgo(7) },
      },
    }),
  ]);

  const totalResultados30d = conformidade30d.reduce((sum, c) => sum + c._count._all, 0);
  const conformeCount = conformidade30d.find((c) => c.conformidade === "CONFORME")?._count._all ?? 0;
  const naoConformeCount = conformidade30d.find((c) => c.conformidade === "NAO_CONFORME")?._count._all ?? 0;
  const atencaoCount = conformidade30d.find((c) => c.conformidade === "ATENCAO")?._count._all ?? 0;
  const taxaConformidade = totalResultados30d > 0 ? Math.round((conformeCount / totalResultados30d) * 100) : 0;

  const cards = [
    { label: "Amostras hoje", value: recebidasHoje, hint: "Recebidas no laboratório", href: "/amostras" },
    { label: "Em análise", value: emAnalise, hint: "Aguardando resultados", href: "/amostras?status=EM_ANALISE" },
    { label: "Aguardando aprovação", value: aguardandoAprovacao, hint: "Pendente do Resp. Técnico", href: "/amostras?status=AGUARDANDO_APROVACAO" },
    { label: "NCs abertas", value: ncsAbertas, hint: "Tratamento em andamento", href: "/nao-conformidades", danger: ncsAbertas > 0 },
  ];

  return (
    <>
      <PageHeader
        title={`Olá, ${user.name?.split(" ")[0] ?? "analista"}`}
        subtitle="Visão operacional do laboratório"
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={
              "rounded-lg border bg-white p-4 transition hover:shadow-sm " +
              (c.danger ? "border-red-200 hover:border-red-300" : "border-slate-200 hover:border-slate-300")
            }
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${c.danger ? "text-red-600" : "text-petroleo"}`}>{c.value}</p>
            <p className="mt-1 text-xs text-slate-400">{c.hint}</p>
          </Link>
        ))}
      </section>

      {/* Cadastros */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <SmallCard label="Produtos" value={totalProdutos} href="/produtos" />
        <SmallCard label="Lotes ativos" value={totalLotesAtivos} href="/lotes" />
        <SmallCard label="Insumos" value={totalInsumos} href="/insumos" />
        <SmallCard label="Fornecedores" value={totalFornecedores} href="/fornecedores" />
        <SmallCard label="Clientes" value={totalClientes} href="/clientes" />
        <SmallCard label="Resultados" value={emAnalise} href="/resultados-analiticos" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-petroleo">Conformidade nos últimos 30 dias</h2>
            <span className="text-xs text-slate-500">{totalResultados30d} resultado(s)</span>
          </div>
          {totalResultados30d === 0 ? (
            <p className="text-center py-8 text-sm text-slate-400">Sem dados ainda.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <div>
                  <div className="text-4xl font-semibold text-emerald-600">{taxaConformidade}%</div>
                  <div className="text-xs text-slate-500">de conformidade</div>
                </div>
                <div className="flex-1">
                  <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                    {conformeCount > 0 && <div style={{ width: `${(conformeCount / totalResultados30d) * 100}%` }} className="bg-emerald-500" title={`${conformeCount} conformes`} />}
                    {atencaoCount > 0 && <div style={{ width: `${(atencaoCount / totalResultados30d) * 100}%` }} className="bg-amber-400" title={`${atencaoCount} em atenção`} />}
                    {naoConformeCount > 0 && <div style={{ width: `${(naoConformeCount / totalResultados30d) * 100}%` }} className="bg-red-500" title={`${naoConformeCount} não conformes`} />}
                  </div>
                  <div className="mt-2 grid grid-cols-3 text-xs">
                    <div><span className="text-emerald-600 font-medium">{conformeCount}</span> conformes</div>
                    <div><span className="text-amber-600 font-medium">{atencaoCount}</span> atenção</div>
                    <div><span className="text-red-600 font-medium">{naoConformeCount}</span> não conformes</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-petroleo mb-3">Alertas</h2>
          <ul className="space-y-2 text-xs">
            {amostrasPrazoVencendo.length > 0 ? (
              amostrasPrazoVencendo.map((a) => (
                <li key={a.id} className="flex items-start gap-2 rounded-md bg-amber-50 p-2 border border-amber-200">
                  <span>⏰</span>
                  <div className="flex-1">
                    <Link href={`/amostras/${a.id}`} className="font-mono font-medium text-amber-900 hover:underline">{a.numeroOS}</Link>
                    <div className="text-amber-800">{a.cliente.razaoSocial} · {a.produto.nome}</div>
                    <div className="text-[10px] text-amber-700">Prazo: {new Date(a.prazoEntrega).toLocaleString("pt-BR")}</div>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-slate-400">Sem prazos críticos.</li>
            )}
            {equipamentosVencidos > 0 && (
              <li className="flex items-center gap-2 rounded-md bg-red-50 p-2 border border-red-200 text-red-800">
                ⚠ <Link href="/equipamentos" className="font-medium hover:underline">{equipamentosVencidos} equipamento(s) com calibração vencida</Link>
              </li>
            )}
            {processosIncapazes > 0 && (
              <li className="flex items-center gap-2 rounded-md bg-red-50 p-2 border border-red-200 text-red-800">
                ⚠ <Link href="/cep" className="font-medium hover:underline">{processosIncapazes} processo(s) incapaz(es) — Cpk &lt; 1,00</Link>
              </li>
            )}
            {pccsForaLimite > 0 && (
              <li className="flex items-center gap-2 rounded-md bg-red-50 p-2 border border-red-200 text-red-800">
                ⚠ <Link href="/appcc" className="font-medium hover:underline">{pccsForaLimite} leitura(s) PCC fora do limite (7d)</Link>
              </li>
            )}
            {documentosRevisaoVencida > 0 && (
              <li className="flex items-center gap-2 rounded-md bg-amber-50 p-2 border border-amber-200 text-amber-800">
                ⚠ <Link href="/documentos" className="font-medium hover:underline">{documentosRevisaoVencida} documento(s) com revisão vencida</Link>
              </li>
            )}
            {treinamentosVencidos > 0 && (
              <li className="flex items-center gap-2 rounded-md bg-amber-50 p-2 border border-amber-200 text-amber-800">
                ⚠ <Link href="/treinamentos" className="font-medium hover:underline">{treinamentosVencidos} treinamento(s) vencido(s)</Link>
              </li>
            )}
          </ul>
        </div>
      </section>

      {/* Produtos recém-cadastrados */}
      {ultimosProdutos.length > 0 && (
        <section className="mb-6 rounded-lg border border-slate-200 bg-white overflow-hidden">
          <header className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-petroleo">Produtos cadastrados recentemente</h2>
            <Link href="/produtos" className="text-xs text-petroleo hover:underline">
              Ver todos →
            </Link>
          </header>
          <ul className="divide-y divide-slate-100">
            {ultimosProdutos.map((p) => (
              <li key={p.id} className="px-4 py-2 text-sm flex items-center gap-3">
                <span className="font-mono text-xs text-slate-500 w-24">{p.codigo}</span>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-slate-800">
                    {p.nome}
                    {p.sabor && <span className="text-slate-500"> · {p.sabor}</span>}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {p._count.especificacoes} parâmetro(s) · {p._count.lotes} lote(s)
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <header className="px-4 py-3 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-petroleo">Últimas amostras</h2>
          </header>
          {ultimasAmostras.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">Nenhuma amostra ainda.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {ultimasAmostras.map((a) => {
                const s = statusAmostra(a.status);
                return (
                  <li key={a.id} className="px-4 py-2 text-sm flex items-center gap-3">
                    <Link href={`/amostras/${a.id}`} className="font-mono text-xs text-petroleo hover:underline w-24">{a.numeroOS}</Link>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-slate-800">{a.produto.nome}</div>
                      <div className="text-[11px] text-slate-500 truncate">{a.cliente.razaoSocial}</div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${s.color}`}>{s.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <header className="px-4 py-3 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-petroleo">Não conformidades recentes</h2>
          </header>
          {ncsRecentes.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">Nenhuma NC aberta — ótimo!</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {ncsRecentes.map((nc) => (
                <li key={nc.id} className="px-4 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Link href="/nao-conformidades" className="font-mono text-xs text-red-700 hover:underline">{nc.numero}</Link>
                    <span className="text-xs text-slate-500">amostra {nc.amostra.numeroOS}</span>
                  </div>
                  <div className="text-xs text-slate-700 mt-0.5 line-clamp-1">{nc.parametro}: {nc.descricao}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

function SmallCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-md border border-slate-200 bg-white px-3 py-2 hover:border-agua transition-colors"
    >
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-0.5 text-xl font-semibold text-petroleo">{value}</div>
    </Link>
  );
}
