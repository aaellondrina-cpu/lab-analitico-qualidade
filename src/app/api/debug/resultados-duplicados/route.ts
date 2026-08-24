import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Encontrar amostras com resultados duplicados
    const amostrasComDuplicatas = await prisma.amostra.findMany({
      where: {
        status: { in: ["APROVADO", "LAUDO_EMITIDO"] },
        resultados: { some: {} },
      },
      include: {
        resultados: {
          select: {
            id: true,
            parametro: true,
            valor: true,
            dataEnsaio: true,
          },
          orderBy: { dataEnsaio: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Agrupar para encontrar duplicatas
    const comDuplicatas = amostrasComDuplicatas
      .map((a) => {
        const grupos = new Map<string, typeof a.resultados>();
        a.resultados.forEach((r) => {
          const key = r.parametro;
          if (!grupos.has(key)) grupos.set(key, []);
          grupos.get(key)!.push(r);
        });

        const duplicatas = Array.from(grupos.entries())
          .filter(([, resultados]) => resultados.length > 1)
          .map(([param, resultados]) => ({
            parametro: param,
            total: resultados.length,
            resultados,
          }));

        return {
          amostraId: a.id,
          numeroOS: a.numeroOS,
          status: a.status,
          totalResultados: a.resultados.length,
          duplicatas,
          temDuplicatas: duplicatas.length > 0,
        };
      })
      .filter((a) => a.temDuplicatas);

    return Response.json({
      amostrasComDuplicatas: comDuplicatas.length,
      amostras: comDuplicatas.slice(0, 10),
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
