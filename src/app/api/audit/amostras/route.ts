import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

export async function GET() {
  try {
    await requireUser();

    const sem_resultados = await prisma.amostra.findMany({
      where: {
        resultados: { none: {} }
      },
      select: {
        id: true,
        numeroOS: true,
        status: true,
        produto: { select: { nome: true } }
      },
      take: 100
    });

    const am474 = await prisma.amostra.findFirst({
      where: { numeroOS: "AM-2026-474" },
      include: { _count: { select: { resultados: true } } }
    });

    const am465 = await prisma.amostra.findFirst({
      where: { numeroOS: "AM-2026-465" },
      include: { _count: { select: { resultados: true } } }
    });

    return Response.json({
      audit: {
        total_sem_resultados: sem_resultados.length,
        am_2026_474: am474 ? { numeroOS: am474.numeroOS, resultados: am474._count.resultados, status: am474.status } : null,
        am_2026_465: am465 ? { numeroOS: am465.numeroOS, resultados: am465._count.resultados, status: am465.status } : null,
        exemplos: sem_resultados.slice(0, 10)
      }
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
