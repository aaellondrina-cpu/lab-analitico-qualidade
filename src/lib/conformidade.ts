export type Conformidade = "CONFORME" | "NAO_CONFORME" | "ATENCAO";

/**
 * Avalia conformidade de um resultado contra os limites de uma especificação.
 *
 * NAO_CONFORME: valor fora dos limites
 * ATENCAO: valor dentro dos limites mas próximo (±10% da faixa) — sinal de tendência
 * CONFORME: valor confortavelmente dentro da faixa
 *
 * Tolerância ATENCAO baseada em 10% da faixa quando ambos os limites existem,
 * ou 10% do próprio valor quando só um lado está definido.
 */
export function avaliarConformidade(
  valor: number,
  minimo: number | null,
  maximo: number | null,
): Conformidade {
  if (minimo !== null && valor < minimo) return "NAO_CONFORME";
  if (maximo !== null && valor > maximo) return "NAO_CONFORME";

  const tem2lados = minimo !== null && maximo !== null;
  const range = tem2lados ? (maximo - minimo) : Math.abs(valor) || 1;
  const margem = range * 0.1;

  if (minimo !== null && valor < minimo + margem) return "ATENCAO";
  if (maximo !== null && valor > maximo - margem) return "ATENCAO";

  return "CONFORME";
}

export function descreverLimite(minimo: number | null, maximo: number | null, unidade: string): string {
  if (minimo !== null && maximo !== null) return `${minimo} a ${maximo} ${unidade}`;
  if (minimo !== null) return `≥ ${minimo} ${unidade}`;
  if (maximo !== null) return `≤ ${maximo} ${unidade}`;
  return "sem limite definido";
}

export const CONFORMIDADE_META: Record<Conformidade, { label: string; color: string; icon: string }> = {
  CONFORME: { label: "Conforme", color: "bg-emerald-100 text-emerald-800", icon: "✓" },
  NAO_CONFORME: { label: "Não Conforme", color: "bg-red-100 text-red-800", icon: "✗" },
  ATENCAO: { label: "Atenção", color: "bg-amber-100 text-amber-800", icon: "⚠" },
};
