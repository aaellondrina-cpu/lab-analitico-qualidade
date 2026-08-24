import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";

interface Inconsistencia {
  tipo: string;
  amostraId: string;
  numeroOS: string;
  detalhes: string;
  severity: "CRITICA" | "ALTA" | "MEDIA" | "BAIXA";
}

export async function GET() {
  try {
    await requireRole("ADMIN");

    const inconsistencias: Inconsistencia[] = [];

    // 1. Amostras com status final mas sem resultados
    const amostrasSemResultados = await prisma.amostra.findMany({
      where: {
        status: { in: ["APROVADO", "LAUDO_EMITIDO"] },
        resultados: { none: {} },
      },
      select: { id: true, numeroOS: true, status: true },
      take: 20,
    });

    amostrasSemResultados.forEach((a) => {
      inconsistencias.push({
        tipo: "AMOSTRA_FINALIZADA_SEM_RESULTADOS",
        amostraId: a.id,
        numeroOS: a.numeroOS,
        detalhes: `Status "${a.status}" mas sem nenhum resultado registrado`,
        severity: "CRITICA",
      });
    });

    // 2. Skip: Conformidade é sempre avaliada no Resultado (não pode ser null)

    // 3. NCs aberta mas amostra aprovada
    const ncsEmAprovadasouEmitidas = await prisma.naoConformidade.findMany({
      where: {
        status: { in: ["ABERTA", "EM_TRATAMENTO"] },
        amostra: {
          status: { in: ["APROVADO", "LAUDO_EMITIDO"] },
        },
      },
      select: {
        id: true,
        amostraId: true,
        status: true,
        amostra: { select: { numeroOS: true, status: true } },
      },
      take: 20,
    });

    ncsEmAprovadasouEmitidas.forEach((nc) => {
      inconsistencias.push({
        tipo: "NC_PENDENTE_EM_AMOSTRA_FINALIZADA",
        amostraId: nc.amostraId,
        numeroOS: nc.amostra.numeroOS,
        detalhes: `NC em status "${nc.status}" mas amostra em status "${nc.amostra.status}"`,
        severity: "ALTA",
      });
    });

    // 4. Resultados duplicados
    const duplicados = await prisma.$queryRaw<any[]>`
      SELECT
        amostraId,
        parametro,
        COUNT(*) as total
      FROM "Resultado"
      GROUP BY amostraId, parametro
      HAVING COUNT(*) > 1
      LIMIT 20
    `;

    const amostrasComDuplicatas = await prisma.amostra.findMany({
      where: {
        id: { in: duplicados.map((d) => d.amostraId) },
      },
      select: { id: true, numeroOS: true },
    });

    const mapAmostraNumero = new Map(amostrasComDuplicatas.map((a) => [a.id, a.numeroOS]));

    duplicados.forEach((d) => {
      inconsistencias.push({
        tipo: "RESULTADO_DUPLICADO",
        amostraId: d.amostraId,
        numeroOS: mapAmostraNumero.get(d.amostraId) || "DESCONHECIDO",
        detalhes: `Parâmetro "${d.parametro}" com ${d.total} registros`,
        severity: "MEDIA",
      });
    });

    // 5. Skip: Especificações sempre têm produto (constraint FK obrigatória)

    return Response.json({
      totalIncongruências: inconsistencias.length,
      porTipo: Object.fromEntries(
        Object.entries(
          inconsistencias.reduce(
            (acc, inc) => {
              acc[inc.tipo] = (acc[inc.tipo] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          )
        )
      ),
      porSeveridade: Object.fromEntries(
        Object.entries(
          inconsistencias.reduce(
            (acc, inc) => {
              acc[inc.severity] = (acc[inc.severity] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>
          )
        )
      ),
      incongruências: inconsistencias.slice(0, 50),
    });
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
