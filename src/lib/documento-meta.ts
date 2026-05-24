export const TIPO_DOCUMENTO = [
  { value: "POP", label: "POP" },
  { value: "ITP", label: "ITP" },
  { value: "FORMULARIO", label: "Formulário" },
  { value: "MANUAL", label: "Manual" },
  { value: "PROCEDIMENTO", label: "Procedimento" },
  { value: "ESPECIFICACAO", label: "Especificação" },
] as const;

export const STATUS_DOCUMENTO_META: Record<string, { label: string; color: string }> = {
  VIGENTE: { label: "Vigente", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  EM_REVISAO: { label: "Em revisão", color: "bg-amber-100 text-amber-700 border-amber-200" },
  OBSOLETO: { label: "Obsoleto", color: "bg-slate-100 text-slate-500 border-slate-200" },
};

export const FORMA_TREINAMENTO = [
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "ONLINE", label: "Online" },
  { value: "ON_THE_JOB", label: "On the job" },
] as const;

export const STATUS_TREINAMENTO_META: Record<string, { label: string; color: string }> = {
  TREINADO: { label: "Treinado", color: "bg-emerald-100 text-emerald-700" },
  EM_DIA: { label: "Em dia", color: "bg-emerald-100 text-emerald-700" },
  VENCIDO: { label: "Vencido", color: "bg-red-100 text-red-700" },
};

export function tipoDocumentoLabel(v: string) {
  return TIPO_DOCUMENTO.find((t) => t.value === v)?.label ?? v;
}

export function formaTreinamentoLabel(v: string) {
  return FORMA_TREINAMENTO.find((t) => t.value === v)?.label ?? v;
}

// Calcula status de treinamento com base na validade
export function statusTreinamentoAtual(validade: Date | null): "TREINADO" | "VENCIDO" {
  if (!validade) return "TREINADO";
  return new Date(validade).getTime() < Date.now() ? "VENCIDO" : "TREINADO";
}
