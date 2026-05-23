"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const STATUS_VALIDOS = ["EM_PRODUCAO", "FINALIZADO", "LIBERADO", "RETIDO", "DESCARTADO"] as const;

const LoteSchema = z.object({
  numero: z.string().min(2, "Número do lote obrigatório").trim().transform((s) => s.toUpperCase()),
  produtoId: z.string().min(1, "Produto obrigatório"),
  sabor: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  dataInicioProducao: z.string().min(1, "Data início obrigatória").transform((s) => new Date(s)),
  dataFimProducao: z
    .string()
    .optional()
    .transform((s) => (s && s.trim() !== "" ? new Date(s) : null)),
  volumeTotal: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  observacoes: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
});

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
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  // Se não tem sabor explícito mas o produto tem, denormaliza
  if (!parsed.data.sabor) {
    const produto = await prisma.produto.findUnique({ where: { id: parsed.data.produtoId } });
    if (produto?.sabor) parsed.data.sabor = produto.sabor;
  }

  const status = parsed.data.dataFimProducao ? "FINALIZADO" : "EM_PRODUCAO";

  let created;
  try {
    created = await prisma.lote.create({
      data: { ...parsed.data, status },
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
