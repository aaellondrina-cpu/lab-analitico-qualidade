"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const TIPOS_INSUMO = [
  "AGUA",
  "ACUCAR",
  "HFCS",
  "CO2",
  "CONCENTRADO",
  "ESSENCIA",
  "EDULCORANTE",
  "ACIDULANTE",
  "CONSERVANTE",
  "CORANTE",
  "OUTRO",
] as const;

const STATUS_LOTE = ["EM_ANALISE", "APROVADO", "REPROVADO", "QUARENTENA"] as const;
const UNIDADES = ["kg", "L", "m3", "un"] as const;

const InsumoSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório").trim(),
  codigo: z.string().min(1, "Código obrigatório").trim(),
  tipo: z.enum(TIPOS_INSUMO),
  fornecedorId: z.string().min(1, "Fornecedor obrigatório"),
  unidadePadrao: z.enum(UNIDADES).default("kg"),
});

export type InsumoFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

export async function criarInsumo(
  _prev: InsumoFormState,
  formData: FormData,
): Promise<InsumoFormState> {
  await requireUser();

  const parsed = InsumoSchema.safeParse({
    nome: formData.get("nome"),
    codigo: formData.get("codigo"),
    tipo: formData.get("tipo"),
    fornecedorId: formData.get("fornecedorId"),
    unidadePadrao: formData.get("unidadePadrao") ?? "kg",
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  let created;
  try {
    created = await prisma.insumo.create({ data: parsed.data });
  } catch (e) {
    const msg = (e as { code?: string }).code === "P2002"
      ? "Já existe um insumo com este código."
      : "Erro ao criar insumo.";
    return { message: msg };
  }

  await auditLog({ action: "CREATE", entity: "Insumo", entityId: created.id, diff: parsed.data });
  revalidatePath("/insumos");
  return { ok: true };
}

export async function excluirInsumo(id: string) {
  await requireUser();
  let removed;
  try {
    removed = await prisma.insumo.delete({ where: { id } });
  } catch {
    return { message: "Não foi possível excluir (insumo pode ter lotes vinculados)." };
  }
  await auditLog({
    action: "DELETE",
    entity: "Insumo",
    entityId: id,
    diff: { nome: removed.nome, codigo: removed.codigo },
  });
  revalidatePath("/insumos");
  return { ok: true };
}

const LoteInsumoSchema = z.object({
  insumoId: z.string().min(1),
  loteFornecedor: z.string().min(1, "Lote obrigatório").trim(),
  dataFabricacao: z.string().min(1, "Data de fabricação obrigatória"),
  dataValidade: z.string().min(1, "Data de validade obrigatória"),
  quantidade: z
    .string()
    .transform((v) => Number(v))
    .refine((v) => !Number.isNaN(v) && v > 0, "Quantidade deve ser maior que zero"),
  unidade: z.enum(UNIDADES),
  certificadoUrl: z.string().trim().url("URL inválida").optional().or(z.literal("").transform(() => undefined)),
  status: z.enum(STATUS_LOTE).default("EM_ANALISE"),
  observacoes: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
});

export type LoteInsumoFormState = InsumoFormState;

export async function criarLoteInsumo(
  _prev: LoteInsumoFormState,
  formData: FormData,
): Promise<LoteInsumoFormState> {
  await requireUser();

  const parsed = LoteInsumoSchema.safeParse({
    insumoId: formData.get("insumoId"),
    loteFornecedor: formData.get("loteFornecedor"),
    dataFabricacao: formData.get("dataFabricacao"),
    dataValidade: formData.get("dataValidade"),
    quantidade: formData.get("quantidade"),
    unidade: formData.get("unidade"),
    certificadoUrl: formData.get("certificadoUrl"),
    status: formData.get("status") ?? "EM_ANALISE",
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  const data = {
    ...parsed.data,
    dataFabricacao: new Date(parsed.data.dataFabricacao),
    dataValidade: new Date(parsed.data.dataValidade),
  };

  let created;
  try {
    created = await prisma.loteInsumo.create({ data });
  } catch {
    return { message: "Erro ao registrar lote de insumo." };
  }

  await auditLog({
    action: "CREATE",
    entity: "LoteInsumo",
    entityId: created.id,
    diff: { ...data, dataFabricacao: data.dataFabricacao.toISOString(), dataValidade: data.dataValidade.toISOString() },
  });
  revalidatePath(`/insumos/${parsed.data.insumoId}`);
  revalidatePath("/insumos");
  return { ok: true };
}

export async function atualizarStatusLoteInsumo(
  id: string,
  status: (typeof STATUS_LOTE)[number],
) {
  await requireUser();
  if (!STATUS_LOTE.includes(status)) return { message: "Status inválido." };
  let updated;
  try {
    updated = await prisma.loteInsumo.update({ where: { id }, data: { status } });
  } catch {
    return { message: "Erro ao atualizar status." };
  }
  await auditLog({ action: "UPDATE", entity: "LoteInsumo", entityId: id, diff: { status } });
  revalidatePath(`/insumos/${updated.insumoId}`);
  revalidatePath("/insumos");
  return { ok: true };
}

export async function excluirLoteInsumo(id: string) {
  await requireUser();
  let removed;
  try {
    removed = await prisma.loteInsumo.delete({ where: { id } });
  } catch {
    return { message: "Não foi possível excluir (lote pode ter consumos ou amostras vinculados)." };
  }
  await auditLog({
    action: "DELETE",
    entity: "LoteInsumo",
    entityId: id,
    diff: { loteFornecedor: removed.loteFornecedor },
  });
  revalidatePath(`/insumos/${removed.insumoId}`);
  revalidatePath("/insumos");
  return { ok: true };
}
