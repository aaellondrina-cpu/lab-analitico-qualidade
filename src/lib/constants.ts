export const TIPOS_PRODUTO = [
  { value: "BEBIDA_ALCOOLICA", label: "Bebida Alcoólica" },
  { value: "NAO_ALCOOLICA", label: "Bebida Não Alcoólica" },
  { value: "AGUA", label: "Água" },
  { value: "MATERIA_PRIMA", label: "Matéria-prima" },
  { value: "EMBALAGEM", label: "Embalagem" },
] as const;

export const TIPOS_PONTO_COLETA = [
  { value: "MATERIA_PRIMA", label: "Matéria-prima" },
  { value: "PROCESSO", label: "Processo" },
  { value: "PRODUTO_ACABADO", label: "Produto Acabado" },
  { value: "AGUA", label: "Água" },
  { value: "CIP", label: "CIP / Limpeza" },
  { value: "AMBIENTE", label: "Ambiente" },
] as const;

export const TIPOS_ANALISE = [
  { value: "ROTINA", label: "Rotina" },
  { value: "RETENCAO", label: "Retenção" },
  { value: "REPROCESSO", label: "Reprocesso" },
  { value: "AUDITORIA", label: "Auditoria" },
  { value: "RECLAMACAO", label: "Atendimento Reclamação" },
] as const;

export const STATUS_AMOSTRA = [
  { value: "RECEBIDA", label: "Recebida", color: "bg-slate-100 text-slate-700" },
  { value: "EM_ANALISE", label: "Em Análise", color: "bg-blue-100 text-blue-700" },
  { value: "AGUARDANDO_APROVACAO", label: "Aguardando Aprovação", color: "bg-amber-100 text-amber-700" },
  { value: "APROVADO", label: "Aprovado", color: "bg-emerald-100 text-emerald-700" },
  { value: "LAUDO_EMITIDO", label: "Laudo Emitido", color: "bg-cyan-100 text-cyan-700" },
] as const;

export const STATUS_LOTE = [
  { value: "EM_PRODUCAO", label: "Em Produção", color: "bg-blue-100 text-blue-700" },
  { value: "FINALIZADO", label: "Produzida", color: "bg-slate-100 text-slate-700" },
  { value: "LIBERADO", label: "Liberada", color: "bg-emerald-100 text-emerald-700" },
  { value: "RETIDO", label: "Retida", color: "bg-amber-100 text-amber-700" },
  { value: "DESCARTADO", label: "Descartada", color: "bg-red-100 text-red-700" },
] as const;

export const STATUS_NC = [
  { value: "ABERTA", label: "Aberta", color: "bg-red-100 text-red-700" },
  { value: "EM_TRATAMENTO", label: "Em Tratamento", color: "bg-amber-100 text-amber-700" },
  { value: "ENCERRADA", label: "Encerrada", color: "bg-emerald-100 text-emerald-700" },
] as const;

export function statusLote(v: string) {
  return STATUS_LOTE.find((s) => s.value === v) ?? { value: v, label: v, color: "bg-slate-100 text-slate-700" };
}

export function statusNC(v: string) {
  return STATUS_NC.find((s) => s.value === v) ?? { value: v, label: v, color: "bg-slate-100 text-slate-700" };
}

export const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  RESPONSAVEL_TECNICO: "Resp. Técnico",
  ANALISTA: "Analista",
  LEITURA: "Leitura",
};

export function tipoProdutoLabel(v: string) {
  return TIPOS_PRODUTO.find((t) => t.value === v)?.label ?? v;
}

export function tipoPontoLabel(v: string) {
  return TIPOS_PONTO_COLETA.find((t) => t.value === v)?.label ?? v;
}

export function tipoAnaliseLabel(v: string) {
  return TIPOS_ANALISE.find((t) => t.value === v)?.label ?? v;
}

export function statusAmostra(v: string) {
  return STATUS_AMOSTRA.find((s) => s.value === v) ?? { value: v, label: v, color: "bg-slate-100 text-slate-700" };
}
