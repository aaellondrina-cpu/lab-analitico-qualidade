import "server-only";
import { prisma } from "@/lib/prisma";
import type { ConfiguracaoLaboratorio } from "@prisma/client";

export type Configuracao = ConfiguracaoLaboratorio;

// Singleton — sempre existe no máximo 1 registro.
// Retorna null se ainda não foi configurado (cabeçalho dos laudos
// renderiza um placeholder discreto nesse caso).
export async function getConfiguracao(): Promise<Configuracao | null> {
  return prisma.configuracaoLaboratorio.findFirst({
    orderBy: { updatedAt: "desc" },
  });
}

export function formacaoLabel(f: string): string {
  const map: Record<string, string> = {
    FARMACEUTICO: "Farmacêutico",
    QUIMICO: "Químico",
    BIOLOGO: "Biólogo",
    ENG_ALIMENTOS: "Eng. de Alimentos",
    OUTRO: "Outro",
  };
  return map[f] ?? f;
}
