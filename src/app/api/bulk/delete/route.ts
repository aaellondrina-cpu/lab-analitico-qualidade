import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";

export async function POST(req: Request) {
  try {
    await requireRole("ADMIN");

    const { tipo, ids } = await req.json();

    if (!tipo || !ids || !Array.isArray(ids) || ids.length === 0) {
      return Response.json(
        { error: "Faltam parâmetros: tipo (resultado|amostra|nc), ids (array)" },
        { status: 400 }
      );
    }

    let deleted = { count: 0 };

    switch (tipo) {
      case "resultado":
        deleted = await prisma.resultado.deleteMany({
          where: { id: { in: ids } },
        });
        break;

      case "amostra":
        deleted = await prisma.amostra.deleteMany({
          where: { id: { in: ids } },
        });
        break;

      case "nc":
        deleted = await prisma.naoConformidade.deleteMany({
          where: { id: { in: ids } },
        });
        break;

      default:
        return Response.json({ error: `Tipo desconhecido: ${tipo}` }, { status: 400 });
    }

    return Response.json({
      tipo,
      deletados: deleted.count,
      mensagem: `${deleted.count} ${tipo}(s) deletado(s) com sucesso`,
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
