"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const STATUS_VALIDOS = ["EM_PRODUCAO", "FINALIZADO", "LIBERADO", "RETIDO", "DESCARTADO"] as const;

const LoteSchema = z.object({
  // Vazio = sistema gera automático no formato ANO-SEQ-CODPROD-VOL-LINHA.
  numero: z.string().trim().optional().transform((s) => (s && s.length > 0 ? s.toUpperCase() : null)),
  produtoId: z.string().min(1, "Produto obrigatório"),
  sabor: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  dataInicioProducao: z.string().min(1, "Data início obrigatória").transform((s) => new Date(s)),
  dataFimProducao: z
    .string()
    .optional()
    .transform((s) => (s && s.trim() !== "" ? new Date(s) : null)),
  volumeTotal: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  unidadesProduzidas: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? Math.trunc(Number(v)) : null))
    .refine((v) => v === null || (!Number.isNaN(v) && v >= 0), "Unidades inválida"),
  linha: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  turno: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  responsavelProducao: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  observacoes: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
});

// Gera numero ANO-SEQ-CODPROD-VOL-LINHA (RDC 259/2002 — fabricante define formato único).
async function gerarNumeroLote(
  produtoCodigo: string,
  volumeMl: number | null,
  linha: string | null,
): Promise<string> {
  const ano = new Date().getFullYear();
  const prefix = `${ano}-`;
  const ult = await prisma.lote.findFirst({
    where: { numero: { startsWith: prefix } },
    orderBy: { numero: "desc" },
  });
  // pega os 4 dígitos depois do prefixo
  const lastSeq = ult ? parseInt(ult.numero.slice(prefix.length, prefix.length + 4), 10) : 0;
  const seq = (Number.isNaN(lastSeq) ? 0 : lastSeq) + 1;
  const codCurto = produtoCodigo.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 8);
  const volStr = volumeMl ? (volumeMl >= 1000 ? `${volumeMl / 1000}L` : `${volumeMl}ML`) : "VOL";
  const linhaStr = linha ? linha.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 3) : "L1";
  return `${ano}-${String(seq).padStart(4, "0")}-${codCurto}-${volStr}-${linhaStr}`;
}

export type LoteFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

export async function criarLote(
  _prev: LoteFormState,
  formData: FormData,
): Promise<LoteFormState> {
  await requireUser();

  const parsed = LoteSchema.safeParse({
    numero: formData.get("numero"),
    produtoId: formData.get("produtoId"),
    sabor: formData.get("sabor"),
    dataInicioProducao: formData.get("dataInicioProducao"),
    dataFimProducao: formData.get("dataFimProducao"),
    volumeTotal: formData.get("volumeTotal"),
    unidadesProduzidas: formData.get("unidadesProduzidas"),
    linha: formData.get("linha"),
    turno: formData.get("turno"),
    responsavelProducao: formData.get("responsavelProducao"),
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  // Busca produto p/ denormalizar sabor, código, MAPA do produto e calcular validade.
  const produto = await prisma.produto.findUnique({
    where: { id: parsed.data.produtoId },
  });
  if (!produto) return { message: "Produto não encontrado." };

  if (!parsed.data.sabor && produto.sabor) parsed.data.sabor = produto.sabor;

  // Busca configuração p/ snapshot do registro MAPA do estabelecimento.
  const cfg = await prisma.configuracaoLaboratorio.findFirst();

  // Calcula data de validade: dataInicioProducao + produto.validadeDias.
  const dataValidade = produto.validadeDias
    ? new Date(parsed.data.dataInicioProducao.getTime() + produto.validadeDias * 86400000)
    : null;

  // Gera número se não informado.
  const numero = parsed.data.numero ?? (await gerarNumeroLote(
    produto.codigo, produto.volume ?? null, parsed.data.linha,
  ));

  const status = parsed.data.dataFimProducao ? "FINALIZADO" : "EM_PRODUCAO";

  let created;
  try {
    created = await prisma.lote.create({
      data: {
        ...parsed.data,
        numero,
        status,
        dataValidade,
        codigoProduto: produto.codigo,
        registroMAPAProduto: produto.mapaProdutoNumero,
        registroMAPAEstab: cfg?.mapaNumero,
      },
    });
  } catch (e) {
    const msg = (e as { code?: string }).code === "P2002"
      ? "Já existe um lote com este número."
      : "Erro ao criar lote.";
    return { message: msg };
  }

  await auditLog({ action: "CREATE", entity: "Lote", entityId: created.id, diff: parsed.data });
  revalidatePath("/lotes");
  return { ok: true };
}

const STATUS_INPUT = z.enum(STATUS_VALIDOS);

export async function atualizarLote(
  _prev: LoteFormState,
  formData: FormData,
): Promise<LoteFormState> {
  await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { message: "ID inválido." };

  const parsed = LoteSchema.safeParse({
    numero: formData.get("numero"),
    produtoId: formData.get("produtoId"),
    sabor: formData.get("sabor"),
    dataInicioProducao: formData.get("dataInicioProducao"),
    dataFimProducao: formData.get("dataFimProducao"),
    volumeTotal: formData.get("volumeTotal"),
    unidadesProduzidas: formData.get("unidadesProduzidas"),
    linha: formData.get("linha"),
    turno: formData.get("turno"),
    responsavelProducao: formData.get("responsavelProducao"),
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  // No update, se numero veio vazio, preserva o atual (não permite null em campo @unique não-nullable).
  const { numero, ...rest } = parsed.data;
  const dataUpdate = numero === null ? rest : { ...rest, numero };

  try {
    await prisma.lote.update({ where: { id }, data: dataUpdate });
  } catch (e) {
    const msg = (e as { code?: string }).code === "P2002"
      ? "Já existe outro lote com este número."
      : "Erro ao atualizar lote.";
    return { message: msg };
  }

  await auditLog({ action: "UPDATE", entity: "Lote", entityId: id, diff: dataUpdate });
  revalidatePath("/lotes");
  return { ok: true };
}

export async function atualizarStatusLote(id: string, novoStatus: string) {
  await requireUser();
  const status = STATUS_INPUT.parse(novoStatus);

  const before = await prisma.lote.findUnique({ where: { id } });
  if (!before) return { message: "Lote não encontrado." };

  const data: { status: string; dataFimProducao?: Date } = { status };
  if (status === "FINALIZADO" && !before.dataFimProducao) {
    data.dataFimProducao = new Date();
  }

  await prisma.lote.update({ where: { id }, data });
  await auditLog({
    action: "UPDATE",
    entity: "Lote",
    entityId: id,
    diff: { before: { status: before.status }, after: data },
  });
  revalidatePath("/lotes");
  return { ok: true };
}

export async function excluirLote(id: string) {
  await requireUser();
  let removed;
  try {
    removed = await prisma.lote.delete({ where: { id } });
  } catch {
    return { message: "Não foi possível excluir (lote pode ter amostras)." };
  }
  await auditLog({ action: "DELETE", entity: "Lote", entityId: id, diff: { numero: removed.numero } });
  revalidatePath("/lotes");
  return { ok: true };
}
