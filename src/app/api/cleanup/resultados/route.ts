import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";

export async function GET() {
  try {
    await requireAdmin();

    // Encontrar resultados duplicados em amostras já emitidas
    const duplicados = await prisma.$queryRaw<any[]>`
      SELECT
        r.id,
        r."amostraId",
        r.parametro,
        r.valor,
        r."dataEnsaio",
        a."numeroOS",
        a.status,
        ROW_NUMBER() OVER (PARTITION BY r."amostraId", r.parametro ORDER BY r."dataEnsaio" DESC, r.id DESC) as seq
      FROM "Resultado" r
      JOIN "Amostra" a ON r."amostraId" = a.id
      WHERE a.status IN ('APROVADO', 'LAUDO_EMITIDO')
      ORDER BY a."numeroOS", r.parametro, seq
    `;

    // Agrupar por amostra e parâmetro
    const grupos = new Map<string, any[]>();
    duplicados.forEach((d) => {
      const key = `${d.amostraId}:${d.parametro}`;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key)!.push(d);
    });

    // Encontrar duplicatas (seq > 1)
    const paraDeletar: string[] = [];
    grupos.forEach((items) => {
      items.forEach((item) => {
        if (item.seq > 1) paraDeletar.push(item.id);
      });
    });

    return Response.json({
      totalDuplicados: paraDeletar.length,
      exemplos: duplicados.slice(0, 20),
      parao: paraDeletar,
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await requireAdmin();

    // Buscar e deletar duplicatas mantendo apenas a mais recente
    const duplicados = await prisma.$queryRaw<any[]>`
      SELECT r.id
      FROM "Resultado" r
      JOIN "Amostra" a ON r."amostraId" = a.id
      WHERE a.status IN ('APROVADO', 'LAUDO_EMITIDO')
      AND r.id NOT IN (
        SELECT DISTINCT ON (r2."amostraId", r2.parametro) r2.id
        FROM "Resultado" r2
        WHERE r2."amostraId" = r."amostraId"
        ORDER BY r2."amostraId", r2.parametro, r2."dataEnsaio" DESC, r2.id DESC
      )
    `;

    const idsParaDeletar = duplicados.map((d) => d.id);

    if (idsParaDeletar.length === 0) {
      return Response.json({ deleted: 0, message: "Nenhuma duplicata encontrada" });
    }

    const deleted = await prisma.resultado.deleteMany({
      where: { id: { in: idsParaDeletar } },
    });

    return Response.json({
      deleted: deleted.count,
      message: `${deleted.count} resultado(s) duplicado(s) removido(s)`,
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
