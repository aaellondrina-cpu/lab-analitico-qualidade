// Helpers puros — podem ser importados tanto em Server quanto Client components.

export function formacaoLabel(f: string | null | undefined): string {
  if (!f) return "—";
  const map: Record<string, string> = {
    FARMACEUTICO: "Farmacêutico",
    QUIMICO: "Químico",
    BIOLOGO: "Biólogo",
    ENG_ALIMENTOS: "Eng. de Alimentos",
    OUTRO: "Outro",
  };
  return map[f] ?? f;
}
