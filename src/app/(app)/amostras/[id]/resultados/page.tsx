import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { ResultadosRapidosForm } from "./_components/ResultadosRapidosForm";

const PACOTES_ENSAIOS: Record<string, Array<{ parametro: string; unidade: string; metodo: string }>> = {
  "Caixa Separadora de Agua e Oleo - CONAMA 430/2011": [
    { parametro: "pH", unidade: "", metodo: "SMEWW 4500-H+ B" },
    { parametro: "DBO5", unidade: "mg/L O2", metodo: "SMEWW 5210 B" },
    { parametro: "Temperatura", unidade: "°C", metodo: "SMEWW 2550 B" },
    { parametro: "Turbidez", unidade: "NTU", metodo: "SMEWW 2130 B" },
    { parametro: "Óleos e graxas", unidade: "mg/L", metodo: "SMEWW 5520 B" },
    { parametro: "Ferro dissolvido", unidade: "mg/L", metodo: "SMEWW 3111 B" },
  ],
  "Água potável - Portaria 914/2011": [
    { parametro: "pH", unidade: "", metodo: "SMEWW 4500-H+ B" },
    { parametro: "Cor", unidade: "uH", metodo: "SMEWW 2120 B" },
    { parametro: "Turbidez", unidade: "NTU", metodo: "SMEWW 2130 B" },
    { parametro: "Cloro residual", unidade: "mg/L", metodo: "SMEWW 4500-Cl G" },
    { parametro: "Alcalinidade", unidade: "mg/L CaCO3", metodo: "SMEWW 2320 B" },
    { parametro: "Dureza total", unidade: "mg/L CaCO3", metodo: "SMEWW 2340 C" },
  ],
  "Bebidas - Análise básica": [
    { parametro: "Aparência", unidade: "Qualitativo", metodo: "Inspeção visual" },
    { parametro: "Sabor", unidade: "Qualitativo", metodo: "Degustação" },
    { parametro: "Aroma", unidade: "Qualitativo", metodo: "Olfato" },
    { parametro: "pH", unidade: "", metodo: "SMEWW 4500-H+ B" },
    { parametro: "Acidez total", unidade: "g/L", metodo: "Titulometria" },
    { parametro: "Açúcares redutores", unidade: "g/L", metodo: "Lane-Eynon" },
  ],
};

export default async function ResultadosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const amostra = await prisma.amostra.findUnique({
    where: { id },
    include: {
      cliente: true,
      produto: { include: { especificacoes: true } },
      lote: true,
      resultados: { orderBy: { dataEnsaio: "desc" } },
    },
  });

  if (!amostra) notFound();

  const equipamentos = await prisma.equipamento.findMany({
    select: { id: true, nome: true, status: true },
    orderBy: { nome: "asc" },
  });

  const canEdit = user.role === "ADMIN" || user.role === "RESPONSAVEL_TECNICO" || user.role === "ANALISTA";

  // Detectar pacote automático baseado no tipo de amostra/produto
  const detectarPacoteAutomatico = () => {
    // Se for água
    if (amostra.tipoPonto === "AGUA" || amostra.produto.tipoProduto === "AGUA") {
      return "Água potável - Portaria 914/2011";
    }
    // Se for bebida
    if (amostra.produto.tipoProduto === "BEBIDA_ALCOOLICA" || amostra.produto.tipoProduto === "NAO_ALCOOLICA") {
      return "Bebidas - Análise básica";
    }
    // Padrão: Caixa separadora
    return "Caixa Separadora de Agua e Oleo - CONAMA 430/2011";
  };

  const pacoteDefault = detectarPacoteAutomatico();

  return (
    <>
      <PageHeader
        title={`Resultados - ${amostra.numeroOS}`}
        subtitle="Resultados analíticos com calculo automático de LD/LQ"
        action={
          <Link
            href={`/amostras/${amostra.id}`}
            className="rounded-md bg-slate-200 hover:bg-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
          >
            ← Voltar
          </Link>
        }
      />

      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-600">Ficha de Coleta</div>
            <div className="text-sm font-mono text-slate-900">COL-2026-955</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-600">Amostra</div>
            <div className="text-sm font-mono text-slate-900">{amostra.numeroOS}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-600">Cliente</div>
            <div className="text-sm text-slate-900">{amostra.cliente.razaoSocial}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-600">Orçamento / Matriz</div>
            <div className="text-sm text-slate-900">- / Água</div>
          </div>
        </div>
      </div>

      {canEdit && (
        <ResultadosRapidosForm
          amostraId={amostra.id}
          pacotesEnsaios={PACOTES_ENSAIOS}
          equipamentos={equipamentos}
          defaultAnalista={user.name ?? user.email ?? ""}
          pacoteDefault={pacoteDefault}
        />
      )}

      {!canEdit && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            ℹ Esta amostra está em status "{amostra.status}" e não pode ter resultados alterados.
          </p>
        </div>
      )}

      <section className="mt-6 rounded-lg border border-slate-200 bg-white overflow-hidden">
        <header className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Resultados registrados ({amostra.resultados.length})</h2>
        </header>
        {amostra.resultados.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-400">Nenhum resultado lançado ainda.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Parâmetro</th>
                <th className="px-4 py-2 text-right">Valor</th>
                <th className="px-4 py-2">Unidade</th>
                <th className="px-4 py-2">Método</th>
                <th className="px-4 py-2">Analista</th>
                <th className="px-4 py-2">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {amostra.resultados.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-900">{r.parametro}</td>
                  <td className="px-4 py-2 text-right font-mono">{r.valor}</td>
                  <td className="px-4 py-2 text-slate-600">{r.unidade}</td>
                  <td className="px-4 py-2 text-xs text-slate-600">{r.metodo ?? "—"}</td>
                  <td className="px-4 py-2 text-xs text-slate-700">{r.analista}</td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {new Date(r.dataEnsaio).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
