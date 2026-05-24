"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";
import { calcularCEP } from "@/lib/cep";

// Janela de cálculo: últimos 90 dias.
const JANELA_DIAS = 90;

export async function recalcularCartas() {
  await requireUser();

  const desde = new Date();
  desde.setDate(desde.getDate() - JANELA_DIAS);

  // Pega todos os resultados na janela com produto+parametro+spec
  const resultados = await prisma.resultado.findMany({
    where: { dataEnsaio: { gte: desde } },
    select: {
      valor: true,
      parametro: true,
      amostra: { select: { produtoId: true } },
    },
  });

  // Agrupa por produto+parametro
  const grupos = new Map<string, { produtoId: string; parametro: string; valores: number[] }>();
  for (const r of resultados) {
    const key = `${r.amostra.produtoId}::${r.parametro}`;
    let g = grupos.get(key);
    if (!g) {
      g = { produtoId: r.amostra.produtoId, parametro: r.parametro, valores: [] };
      grupos.set(key, g);
    }
    g.valores.push(r.valor);
  }

  let criadas = 0;
  for (const g of grupos.values()) {
    if (g.valores.length < 5) continue;

    // Busca limites do cadastro de Especificacao
    const spec = await prisma.especificacao.findFirst({
      where: { produtoId: g.produtoId, parametro: g.parametro },
      select: { minimo: true, maximo: true },
    });

    const calc = calcularCEP(g.valores, {
      lse: spec?.maximo ?? null,
      lie: spec?.minimo ?? null,
    });

    await prisma.cartaControle.upsert({
      where: {
        produtoId_parametro: { produtoId: g.produtoId, parametro: g.parametro },
      },
      create: {
        produtoId: g.produtoId,
        parametro: g.parametro,
        amostras: calc.amostras,
        media: calc.media,
        desvio: calc.desvio,
        lcs: calc.lcs,
        lc: calc.lc,
        lci: calc.lci,
        lse: calc.lse,
        lie: calc.lie,
        cp: calc.cp,
        cpk: calc.cpk,
        classificacao: calc.classificacao,
        alertasNelson: calc.alertasNelson.join(","),
        recalculadaEm: new Date(),
      },
      update: {
        amostras: calc.amostras,
        media: calc.media,
        desvio: calc.desvio,
        lcs: calc.lcs,
        lc: calc.lc,
        lci: calc.lci,
        lse: calc.lse,
        lie: calc.lie,
        cp: calc.cp,
        cpk: calc.cpk,
        classificacao: calc.classificacao,
        alertasNelson: calc.alertasNelson.join(","),
        recalculadaEm: new Date(),
      },
    });
    criadas++;
  }

  await auditLog({ action: "UPDATE", entity: "CartaControle", diff: { recalculadas: criadas, janelaDias: JANELA_DIAS } });
  revalidatePath("/cep");
  return { ok: true, recalculadas: criadas };
}
