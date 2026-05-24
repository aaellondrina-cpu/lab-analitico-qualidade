export const TIPO_PERIGO_META: Record<string, { label: string; color: string }> = {
  BIOLOGICO: { label: "Biológico", color: "bg-emerald-100 text-emerald-700" },
  QUIMICO: { label: "Químico", color: "bg-amber-100 text-amber-700" },
  FISICO: { label: "Físico", color: "bg-slate-100 text-slate-700" },
  RADIOLOGICO: { label: "Radiológico", color: "bg-purple-100 text-purple-700" },
};

export const NIVEL_META: Record<string, { label: string; color: string }> = {
  ALTA: { label: "Alta", color: "bg-red-100 text-red-700" },
  MEDIA: { label: "Média", color: "bg-amber-100 text-amber-700" },
  BAIXA: { label: "Baixa", color: "bg-emerald-100 text-emerald-700" },
};

// Matriz simples de risco (probabilidade × severidade)
export function calcularRisco(probabilidade: string, severidade: string): "ALTO" | "MEDIO" | "BAIXO" {
  const p = NIVEL_NUM[probabilidade] ?? 0;
  const s = NIVEL_NUM[severidade] ?? 0;
  const score = p * s;
  if (score >= 6) return "ALTO";
  if (score >= 3) return "MEDIO";
  return "BAIXO";
}

const NIVEL_NUM: Record<string, number> = { ALTA: 3, MEDIA: 2, BAIXA: 1 };

export const RISCO_META: Record<string, { label: string; color: string }> = {
  ALTO: { label: "Risco alto", color: "bg-red-100 text-red-700 border-red-200" },
  MEDIO: { label: "Risco médio", color: "bg-amber-100 text-amber-700 border-amber-200" },
  BAIXO: { label: "Risco baixo", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};
