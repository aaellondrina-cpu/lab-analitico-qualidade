import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const STATUS_RESULTADO = {
  SEM_RESULTADOS: { label: "Sem resultados", color: "bg-green-100 text-green-800 border-green-300" },
  COM_RESULTADOS: { label: "Com resultados", color: "bg-blue-100 text-blue-800 border-blue-300" },
  COMPLETO: { label: "Completo", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  RECEBIDO_LAB: { label: "Recebido no lab", color: "bg-purple-100 text-purple-800 border-purple-300" },
};

type StatusResultado = keyof typeof STATUS_RESULTADO;

function determinarStatusResultado(
  amostraStatus: string,
  numResultados: number,
  numEspecificacoes: number
): StatusResultado {
  if (numResultados === 0) return "SEM_RESULTADOS";
  if (amostraStatus === "RECEBIDA") return "RECEBIDO_LAB";
  if (numEspecificacoes > 0 && numResultados >= numEspecificacoes) return "COMPLETO";
  return "COM_RESULTADOS";
}

function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function ResultadosAnaliticosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; busca?: string }>;
}) {
  await requireUser();
  const params = await searchParams;

  const where: any = {};
  if (params.status && params.status !== "TODOS") {
    where.status = params.status;
  }

  const amostras = await prisma.amostra.findMany({
    where,
    include: {
      cliente: { select: { razaoSocial: true } },
      produto: { select: { nome: true, codigo: true, especificacoes: { select: { id: true } } } },
      lote: { select: { numero: true } },
      resultados: { select: { id: true } },
      ncs: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Filtro por busca se fornecido
  const amostrasFiltradas = params.busca
    ? amostras.filter((a) => {
        const termo = params.busca!.toLowerCase();
        return (
          a.numeroOS.toLowerCase().includes(termo) ||
          a.cliente.razaoSocial.toLowerCase().includes(termo)
        );
      })
    : amostras;

  // Contar por status
  const contadores = {
    TODOS: amostrasFiltradas.length,
    SEM_RESULTADOS: 0,
    COM_RESULTADOS: 0,
    COMPLETO: 0,
    RECEBIDO_LAB: 0,
  };

  amostrasFiltradas.forEach((a) => {
    const statusRes = determinarStatusResultado(
      a.status,
      a.resultados.length,
      a.produto.especificacoes.length
    );
    contadores[statusRes]++;
  });

  // Filtrar por status de resultado se fornecido
  const amostraExibir = amostrasFiltradas.filter((a) => {
    if (!params.status || params.status === "TODOS") return true;
    const statusRes = determinarStatusResultado(
      a.status,
      a.resultados.length,
      a.produto.especificacoes.length
    );
    return statusRes === params.status;
  });

  return (
    <>
      <PageHeader
        title="Resultados Analíticos"
        subtitle="Selecione uma amostra para visualizar ou cadastrar resultados"
      />

      {/* Filtros de Status */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/resultados-analiticos"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !params.status || params.status === "TODOS"
              ? "bg-petroleo text-white"
              : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          Todas ({contadores.TODOS})
        </Link>
        <Link
          href="/resultados-analiticos?status=RECEBIDO_LAB"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            params.status === "RECEBIDO_LAB"
              ? "bg-purple-600 text-white"
              : "bg-purple-100 border border-purple-300 text-purple-800 hover:bg-purple-200"
          }`}
        >
          Recebimento ({contadores.RECEBIDO_LAB})
        </Link>
        <Link
          href="/resultados-analiticos?status=SEM_RESULTADOS"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            params.status === "SEM_RESULTADOS"
              ? "bg-green-600 text-white"
              : "bg-green-100 border border-green-300 text-green-800 hover:bg-green-200"
          }`}
        >
          Conferido ({contadores.SEM_RESULTADOS})
        </Link>
        <Link
          href="/resultados-analiticos?status=COM_RESULTADOS"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            params.status === "COM_RESULTADOS"
              ? "bg-blue-600 text-white"
              : "bg-blue-100 border border-blue-300 text-blue-800 hover:bg-blue-200"
          }`}
        >
          Em Análise ({contadores.COM_RESULTADOS})
        </Link>
        <Link
          href="/resultados-analiticos?status=COMPLETO"
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            params.status === "COMPLETO"
              ? "bg-emerald-600 text-white"
              : "bg-emerald-100 border border-emerald-300 text-emerald-800 hover:bg-emerald-200"
          }`}
        >
          Analisado ({contadores.COMPLETO})
        </Link>
      </div>

      {/* Barra de busca */}
      <div className="mb-4">
        <form method="GET" className="flex gap-2">
          <input
            type="text"
            name="busca"
            placeholder="Buscar por número da amostra ou cliente..."
            defaultValue={params.busca ?? ""}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-petroleo px-4 py-2 text-sm font-medium text-white hover:bg-petroleo-dark"
          >
            Buscar
          </button>
          {params.busca && (
            <Link
              href="/resultados-analiticos"
              className="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
            >
              Limpar
            </Link>
          )}
        </form>
      </div>

      {/* Tabela de resultados */}
      {amostraExibir.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
          Nenhuma amostra encontrada.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-left text-xs uppercase tracking-wide text-white">
              <tr>
                <th className="px-4 py-3">Amostra</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Data Recebimento</th>
                <th className="px-4 py-3">Conformidade</th>
                <th className="px-4 py-3">Resultados</th>
                <th className="px-4 py-3">Etapa</th>
                <th className="px-4 py-3">Status Geral</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {amostraExibir.map((a) => {
                const statusResultado = determinarStatusResultado(
                  a.status,
                  a.resultados.length,
                  a.produto.especificacoes.length
                );
                const statusInfo = STATUS_RESULTADO[statusResultado];

                return (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-petroleo">
                      <Link href={`/amostras/${a.id}`} className="hover:underline">
                        {a.numeroOS}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{a.cliente.razaoSocial}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{fmtDate(a.dataRecebimento)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium border ${
                          a.ncs.length === 0
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }`}
                      >
                        {a.ncs.length === 0 ? "Conforme" : `${a.ncs.length} NC(s)`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {a.resultados.length === 0 ? (
                        <span className="text-slate-500">Sem resultados</span>
                      ) : (
                        <span className="text-slate-700 font-medium">
                          {a.resultados.length} de {a.produto.especificacoes.length || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{a.status}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/amostras/${a.id}`}
                          className="text-petroleo hover:underline text-xs font-medium"
                          title="Visualizar amostra"
                        >
                          👁
                        </Link>
                        <Link
                          href={`/amostras/${a.id}/resultados`}
                          className="text-petroleo hover:underline text-xs font-medium"
                          title="Entrada rápida de resultados"
                        >
                          📝
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
