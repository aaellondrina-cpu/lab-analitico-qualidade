// Helpers de Controle Estatístico de Processo (CEP/SPC).
// Cartas de Shewhart (X̄ e R), índices Cp/Cpk e Regras de Nelson.
// Referência: ISO 7870, AIAG SPC, Coca-Cola Quality Standards.

export type Ponto = { valor: number; data: Date; amostraId: string };

export type CalculoCEP = {
  amostras: number;
  media: number;
  desvio: number;
  lcs: number;
  lc: number;
  lci: number;
  lse: number | null;
  lie: number | null;
  cp: number | null;
  cpk: number | null;
  classificacao: "CAPAZ" | "ATENCAO" | "INCAPAZ" | "INSUFICIENTE";
  alertasNelson: string[];
};

export function calcularCEP(
  pontos: number[],
  spec: { lse: number | null; lie: number | null },
): CalculoCEP {
  const n = pontos.length;

  if (n < 5) {
    // Amostra muito pequena pra ter significado estatístico
    return {
      amostras: n,
      media: 0,
      desvio: 0,
      lcs: 0,
      lc: 0,
      lci: 0,
      lse: spec.lse,
      lie: spec.lie,
      cp: null,
      cpk: null,
      classificacao: "INSUFICIENTE",
      alertasNelson: [],
    };
  }

  const media = pontos.reduce((s, v) => s + v, 0) / n;
  const variancia = pontos.reduce((s, v) => s + (v - media) ** 2, 0) / (n - 1);
  const desvio = Math.sqrt(variancia);

  const lcs = media + 3 * desvio;
  const lci = media - 3 * desvio;

  // Cp / Cpk — só faz sentido com limites de especificação
  let cp: number | null = null;
  let cpk: number | null = null;
  if (desvio > 0) {
    if (spec.lse !== null && spec.lie !== null) {
      cp = (spec.lse - spec.lie) / (6 * desvio);
      const cpu = (spec.lse - media) / (3 * desvio);
      const cpl = (media - spec.lie) / (3 * desvio);
      cpk = Math.min(cpu, cpl);
    } else if (spec.lse !== null) {
      cpk = (spec.lse - media) / (3 * desvio);
    } else if (spec.lie !== null) {
      cpk = (media - spec.lie) / (3 * desvio);
    }
  }

  let classificacao: CalculoCEP["classificacao"] = "INSUFICIENTE";
  if (cpk !== null) {
    if (cpk >= 1.33) classificacao = "CAPAZ";
    else if (cpk >= 1.0) classificacao = "ATENCAO";
    else classificacao = "INCAPAZ";
  } else {
    // Sem espec — avalia só dispersão
    classificacao = "ATENCAO";
  }

  return {
    amostras: n,
    media,
    desvio,
    lcs,
    lc: media,
    lci,
    lse: spec.lse,
    lie: spec.lie,
    cp,
    cpk,
    classificacao,
    alertasNelson: nelsonRules(pontos, media, lcs, lci),
  };
}

// Regras de Nelson — versão reduzida (3 mais comuns).
// Indicam quando o processo perde estabilidade mesmo dentro dos limites.
export function nelsonRules(
  pontos: number[],
  media: number,
  lcs: number,
  lci: number,
): string[] {
  const alertas: string[] = [];
  if (pontos.length < 7) return alertas;

  // R1 — ponto fora dos limites de controle
  if (pontos.some((p) => p > lcs || p < lci)) {
    alertas.push("REGRA_1");
  }

  // R2 — 7 pontos consecutivos do mesmo lado da linha central
  let acima = 0;
  let abaixo = 0;
  let maxRun = 0;
  let runAcima = true;
  for (const p of pontos) {
    if (p > media) {
      acima++;
      abaixo = 0;
      if (acima > maxRun) {
        maxRun = acima;
        runAcima = true;
      }
    } else if (p < media) {
      abaixo++;
      acima = 0;
      if (abaixo > maxRun) {
        maxRun = abaixo;
        runAcima = false;
      }
    } else {
      acima = 0;
      abaixo = 0;
    }
  }
  if (maxRun >= 7) {
    alertas.push(runAcima ? "REGRA_2_ACIMA" : "REGRA_2_ABAIXO");
  }

  // R3 — 7 pontos consecutivos em sequência crescente ou decrescente
  let crescente = 1;
  let decrescente = 1;
  let maxSeq = 1;
  let seqCrescente = true;
  for (let i = 1; i < pontos.length; i++) {
    if (pontos[i] > pontos[i - 1]) {
      crescente++;
      decrescente = 1;
      if (crescente > maxSeq) {
        maxSeq = crescente;
        seqCrescente = true;
      }
    } else if (pontos[i] < pontos[i - 1]) {
      decrescente++;
      crescente = 1;
      if (decrescente > maxSeq) {
        maxSeq = decrescente;
        seqCrescente = false;
      }
    } else {
      crescente = 1;
      decrescente = 1;
    }
  }
  if (maxSeq >= 7) {
    alertas.push(seqCrescente ? "REGRA_3_CRESCENTE" : "REGRA_3_DECRESCENTE");
  }

  return alertas;
}

export const NELSON_LABELS: Record<string, string> = {
  REGRA_1: "Ponto fora dos limites de controle (±3σ)",
  REGRA_2_ACIMA: "7+ pontos consecutivos acima da média (tendência)",
  REGRA_2_ABAIXO: "7+ pontos consecutivos abaixo da média (tendência)",
  REGRA_3_CRESCENTE: "7+ pontos em sequência crescente (deriva)",
  REGRA_3_DECRESCENTE: "7+ pontos em sequência decrescente (deriva)",
};

export const CLASSIFICACAO_META: Record<string, { label: string; color: string; icon: string }> = {
  CAPAZ: { label: "Processo capaz", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: "✓" },
  ATENCAO: { label: "Atenção", color: "bg-amber-100 text-amber-700 border-amber-200", icon: "⚠" },
  INCAPAZ: { label: "Processo incapaz", color: "bg-red-100 text-red-700 border-red-200", icon: "✗" },
  INSUFICIENTE: { label: "Dados insuficientes", color: "bg-slate-100 text-slate-500 border-slate-200", icon: "—" },
};
