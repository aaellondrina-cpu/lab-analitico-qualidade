import "server-only";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

// Reaproveita a mesma estrutura de resultados do demo-seed.mjs.
// Mantida em sync manual (script: demo-seed.mjs, runtime: este arquivo).
const RESULTADOS_CONFORMES = [
  { parametro: "°Brix (sólidos solúveis)", valor: 11.0, unidade: "°Brix", conformidade: "CONFORME" },
  { parametro: "Densidade", valor: 1.05, unidade: "g/mL", conformidade: "CONFORME" },
  { parametro: "CO2 (carbonatação)", valor: 3.5, unidade: "volumes", conformidade: "CONFORME" },
  { parametro: "Acidez total titulável", valor: 0.12, unidade: "g/100mL", conformidade: "CONFORME" },
  { parametro: "Cor (absorbância)", valor: 1.5, unidade: "AU", conformidade: "CONFORME" },
  { parametro: "Turbidez", valor: 1.2, unidade: "NTU", conformidade: "CONFORME" },
  { parametro: "Coliformes totais", valor: 20, unidade: "NMP/mL", conformidade: "CONFORME" },
  { parametro: "Escherichia coli", valor: 0, unidade: "NMP/mL", conformidade: "CONFORME" },
  { parametro: "Bolores e leveduras", valor: 30, unidade: "UFC/mL", conformidade: "CONFORME" },
  { parametro: "Bactérias heterotróficas", valor: 200, unidade: "UFC/mL", conformidade: "CONFORME" },
] as const;

const RESULTADOS_REPROVADOS = RESULTADOS_CONFORMES.map((r) => {
  if (r.parametro === "CO2 (carbonatação)") {
    return { ...r, valor: 5.5, conformidade: "NAO_CONFORME" as const };
  }
  if (r.parametro === "Coliformes totais") {
    return { ...r, valor: 250, conformidade: "NAO_CONFORME" as const };
  }
  return r;
});

function diasAtras(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/**
 * Gera 3 laudos demo (2 APROVADO + 1 REPROVADO com NC) para um cliente.
 * Usa o primeiro Produto cadastrado (idealmente REF-0002 — Refrigerante Pet).
 * Idempotente por slug do cliente: se já existem lotes "L-PORTAL-{clienteId}-*",
 * pula. Útil pra signup público — cliente novo não fica com portal vazio.
 */
export async function seedDemoLaudosForCliente(clienteId: string) {
  const produto = await prisma.produto.findFirst({
    where: { codigo: "REF-0002" },
  });
  if (!produto) return { criados: 0, motivo: "Produto REF-0002 não cadastrado" };

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) return { criados: 0, motivo: "Admin não encontrado" };

  // Idempotência: se já tem amostra com OS "DEMO-PORTAL-{clienteId}-*", pula.
  const jaExiste = await prisma.amostra.findFirst({
    where: { numeroOS: { startsWith: `DEMO-PORTAL-${clienteId.slice(0, 8)}` } },
  });
  if (jaExiste) return { criados: 0, motivo: "Demo já criado" };

  const slug = clienteId.slice(0, 8).toUpperCase();
  let criados = 0;

  for (let i = 0; i < 3; i++) {
    const reprovado = i === 2; // 3º laudo é reprovado pra mostrar fluxo de NC
    const numeroLote = `L-PORTAL-${slug}-${i + 1}`;
    const numeroOS = `DEMO-PORTAL-${slug}-${i + 1}`;
    const numLaudo = `L-DEMO-${slug}-${String(i + 1).padStart(3, "0")}`;

    const lote = await prisma.lote.create({
      data: {
        numero: numeroLote,
        produtoId: produto.id,
        sabor: produto.sabor,
        dataInicioProducao: diasAtras(20 - i * 7),
        dataFimProducao: diasAtras(19 - i * 7),
        volumeTotal: "5000L",
        unidadesProduzidas: 8333,
        linha: `Linha ${(i % 3) + 1}`,
        turno: ["MANHA", "TARDE", "NOITE"][i % 3],
        responsavelProducao: "Equipe de Produção",
        status: reprovado ? "REPROVADO" : "APROVADO",
      },
    });

    const amostra = await prisma.amostra.create({
      data: {
        numeroOS,
        clienteId,
        produtoId: produto.id,
        loteId: lote.id,
        tipoAnalise: "ROTINA",
        status: "LAUDO_EMITIDO",
        quantidade: 3,
        volume: "1,5L",
        tempTransporte: 4.0,
        integridadeOk: true,
        responsavelColeta: "Coletador LimsQual",
        dataColeta: diasAtras(15 - i * 7),
        dataRecebimento: diasAtras(14 - i * 7),
        prazoEntrega: diasAtras(10 - i * 7),
      },
    });

    const fonte = reprovado ? RESULTADOS_REPROVADOS : RESULTADOS_CONFORMES;
    for (const r of fonte) {
      const resultado = await prisma.resultado.create({
        data: {
          amostraId: amostra.id,
          parametro: r.parametro,
          valor: r.valor,
          unidade: r.unidade,
          metodo: "AOAC 2024",
          conformidade: r.conformidade,
          analista: "Analista LimsQual",
          dataEnsaio: diasAtras(12 - i * 7),
        },
      });
      if (r.conformidade === "NAO_CONFORME") {
        const numeroNC = `NC-PORTAL-${slug}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
        await prisma.naoConformidade.create({
          data: {
            numero: numeroNC,
            amostraId: amostra.id,
            resultadoId: resultado.id,
            parametro: r.parametro,
            valorObtido: r.valor,
            limite: r.parametro === "CO2 (carbonatação)" ? "3,0–4,0" : "≤100",
            descricao: `Valor obtido (${r.valor}) fora do limite especificado.`,
            acao: "RETER",
            responsavel: "RT",
            prazo: diasAtras(-7),
            status: "ABERTA",
          },
        });
      }
    }

    await prisma.laudo.create({
      data: {
        numero: numLaudo,
        amostraId: amostra.id,
        conclusao: reprovado ? "REPROVADO" : "APROVADO",
        observacoes: reprovado
          ? "Amostra reprovada por CO2 acima do limite e contagem de coliformes acima do especificado."
          : "Todos os parâmetros físico-químicos e microbiológicos dentro da especificação.",
        emitidoPorId: admin.id,
        emitidoPorNome: admin.name,
        emitidoPorRole: admin.role,
        qrToken: crypto.randomBytes(16).toString("hex"),
      },
    });

    criados++;
  }

  return { criados };
}
