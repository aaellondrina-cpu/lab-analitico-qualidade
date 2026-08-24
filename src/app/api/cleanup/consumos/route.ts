import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

export async function GET() {
  try {
    const user = await requireUser();
    if (user.role !== "ADMIN") {
      return Response.json({ error: "Apenas admin" }, { status: 403 });
    }

    const consumos = await prisma.consumoInsumo.findMany({
      orderBy: { createdAt: "desc" }
    });

    const grupos = new Map<string, typeof consumos>();
    consumos.forEach(c => {
      const key = `${c.loteId}::${c.loteInsumoId}`;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push(c);
    });

    const duplicados: typeof consumos = [];
    grupos.forEach(items => {
      if (items.length > 1) {
        duplicados.push(...items.slice(1));
      }
    });

    return Response.json({
      audit: {
        total_consumos: consumos.length,
        grupos_unicos: grupos.size,
        registros_duplicados: duplicados.length,
        exemplo: duplicados.slice(0, 3)
      }
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    if (user.role !== "ADMIN") {
      return Response.json({ error: "Apenas admin" }, { status: 403 });
    }

    const consumos = await prisma.consumoInsumo.findMany({
      orderBy: { createdAt: "desc" }
    });

    const grupos = new Map<string, typeof consumos>();
    consumos.forEach(c => {
      const key = `${c.loteId}::${c.loteInsumoId}`;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push(c);
    });

    const paraDeleta: string[] = [];
    grupos.forEach(items => {
      if (items.length > 1) {
        paraDeleta.push(...items.slice(1).map(i => i.id));
      }
    });

    let deletados = 0;
    if (paraDeleta.length > 0) {
      const result = await prisma.consumoInsumo.deleteMany({
        where: { id: { in: paraDeleta } }
      });
      deletados = result.count;
    }

    return Response.json({
      limpeza: {
        registros_duplicados_deletados: deletados,
        status: "Sistema limpo com sucesso"
      }
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
