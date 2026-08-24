import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";

export async function POST(req: Request) {
  try {
    await requireRole("ADMIN");

    const { numeroOS, parametros } = await req.json();

    if (!numeroOS || !parametros || !Array.isArray(parametros)) {
      return Response.json({
        error: "Faltam parâmetros: numeroOS, parametros (array)",
      }, { status: 400 });
    }

    // Encontrar amostra
    const amostra = await prisma.amostra.findUnique({
      where: { numeroOS },
      select: { id: true, numeroOS: true },
    });

    if (!amostra) {
      return Response.json({ error: `Amostra ${numeroOS} não encontrada` }, { status: 404 });
    }

    // Deletar resultados com esses parâmetros
    const deleted = await prisma.resultado.deleteMany({
      where: {
        amostraId: amostra.id,
        parametro: { in: parametros },
      },
    });

    return Response.json({
      amostra: amostra.numeroOS,
      parametrosDeletados: deleted.count,
      detalhes: parametros.slice(0, 5).join(", ") + (parametros.length > 5 ? "..." : ""),
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await requireRole("ADMIN");

    const { searchParams } = new URL(req.url);
    const numeroOS = searchParams.get("numeroOS");

    if (!numeroOS) {
      return Response.json({ error: "Falta parâmetro: numeroOS" }, { status: 400 });
    }

    // Listar resultados da amostra
    const resultados = await prisma.resultado.findMany({
      where: {
        amostra: { numeroOS },
      },
      select: { id: true, parametro: true, valor: true, unidade: true, dataEnsaio: true },
      orderBy: { dataEnsaio: "desc" },
    });

    return Response.json({
      numeroOS,
      totalResultados: resultados.length,
      resultados,
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
