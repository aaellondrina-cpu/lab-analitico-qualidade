import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";

export async function GET() {
  try {
    await requireRole("ADMIN");

    // Encontrar grupos de resultados lançados em lote (múltiplos parâmetros da mesma amostra no mesmo dia)
    const lotes = await prisma.$queryRaw<any[]>`
      SELECT
        amostraId,
        DATE(CAST("dataEnsaio" AS DATE)) as data,
        analista,
        COUNT(*) as total_parametros
      FROM "Resultado"
      GROUP BY amostraId, DATE(CAST("dataEnsaio" AS DATE)), analista
      HAVING COUNT(*) > 3
      ORDER BY data DESC, amostraId
      LIMIT 50
    `;

    // Contar resultados por amostra em cada lote
    const detalhes = await Promise.all(
      lotes.map(async (lote) => {
        const resultados = await prisma.resultado.findMany({
          where: {
            amostraId: lote.amostraId,
            dataEnsaio: {
              gte: new Date(lote.data),
              lt: new Date(new Date(lote.data).getTime() + 24 * 60 * 60 * 1000),
            },
            analista: lote.analista,
          },
          select: { id: true, parametro: true, valor: true, dataEnsaio: true },
          orderBy: { dataEnsaio: "desc" },
        });

        return {
          amostraId: lote.amostraId,
          data: lote.data,
          analista: lote.analista,
          totalParametros: resultados.length,
          resultados,
        };
      })
    );

    return Response.json({
      lotesEncontrados: detalhes.length,
      detalhes: detalhes.slice(0, 10),
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireRole("ADMIN");

    const { amostraId, data, analista } = await req.json();

    if (!amostraId || !data || !analista) {
      return Response.json({ error: "Faltam parâmetros: amostraId, data, analista" }, { status: 400 });
    }

    // Deletar resultados específicos do lançamento em lote
    const dataInicio = new Date(data);
    const dataFim = new Date(dataInicio.getTime() + 24 * 60 * 60 * 1000);

    const deleted = await prisma.resultado.deleteMany({
      where: {
        amostraId,
        dataEnsaio: {
          gte: dataInicio,
          lt: dataFim,
        },
        analista,
      },
    });

    return Response.json({
      deleted: deleted.count,
      message: `${deleted.count} resultado(s) de lançamento em lote deletado(s)`,
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
