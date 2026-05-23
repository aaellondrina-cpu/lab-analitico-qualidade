import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function isoDate(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString();
}

export async function GET() {
  await requireUser();

  const amostras = await prisma.amostra.findMany({
    include: {
      cliente: { select: { razaoSocial: true, cnpj: true } },
      produto: { select: { nome: true, codigo: true } },
      lote: { select: { numero: true } },
      pontoColeta: { select: { nome: true } },
      resultados: { select: { parametro: true, valor: true, unidade: true, conformidade: true } },
      laudo: { select: { numero: true, conclusao: true } },
    },
    orderBy: { dataColeta: "desc" },
  });

  const header = [
    "numeroOS",
    "status",
    "tipoAnalise",
    "cliente",
    "cnpj",
    "produto",
    "codigoProduto",
    "lote",
    "pontoColeta",
    "dataColeta",
    "dataRecebimento",
    "prazoEntrega",
    "totalResultados",
    "conformes",
    "naoConformes",
    "atencao",
    "laudoNumero",
    "laudoConclusao",
  ].join(",");

  const linhas = amostras.map((a) => {
    const total = a.resultados.length;
    const conformes = a.resultados.filter((r) => r.conformidade === "CONFORME").length;
    const ncs = a.resultados.filter((r) => r.conformidade === "NAO_CONFORME").length;
    const atencao = a.resultados.filter((r) => r.conformidade === "ATENCAO").length;
    return [
      a.numeroOS,
      a.status,
      a.tipoAnalise,
      a.cliente.razaoSocial,
      a.cliente.cnpj,
      a.produto.nome,
      a.produto.codigo,
      a.lote.numero,
      a.pontoColeta?.nome ?? "",
      isoDate(a.dataColeta),
      isoDate(a.dataRecebimento),
      isoDate(a.prazoEntrega),
      total,
      conformes,
      ncs,
      atencao,
      a.laudo?.numero ?? "",
      a.laudo?.conclusao ?? "",
    ]
      .map(csvEscape)
      .join(",");
  });

  const csv = [header, ...linhas].join("\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="amostras-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
