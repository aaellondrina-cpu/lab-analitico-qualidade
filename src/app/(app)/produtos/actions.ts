"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const TIPOS_ESPEC = ["FISICOQUIMICO", "MICROBIOLOGICO", "SENSORIAL"] as const;

const EspecificacaoSchema = z.object({
  parametro: z.string().min(1, "Parâmetro obrigatório").trim(),
  tipo: z.enum(TIPOS_ESPEC).default("FISICOQUIMICO"),
  minimo: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === null || v === undefined) return null;
      if (typeof v === "number") return v;
      return v.trim() !== "" ? Number(v) : null;
    }),
  maximo: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((v) => {
      if (v === null || v === undefined) return null;
      if (typeof v === "number") return v;
      return v.trim() !== "" ? Number(v) : null;
    }),
  unidade: z.string().min(1, "Unidade obrigatória").trim(),
  metodo: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  legislacao: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
});

const TIPOS_VALIDOS = ["BEBIDA_ALCOOLICA", "NAO_ALCOOLICA", "AGUA", "MATERIA_PRIMA", "EMBALAGEM"] as const;

const ProdutoSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").trim(),
  codigo: z.string().min(1, "Código obrigatório").trim().transform((s) => s.toUpperCase()),
  tipo: z.enum(TIPOS_VALIDOS),
  sabor: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  especificacoes: z.array(EspecificacaoSchema).default([]),
});

export type ProdutoFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

export async function criarProduto(
  _prev: ProdutoFormState,
  formData: FormData,
): Promise<ProdutoFormState> {
  await requireUser();

  const rawEspecs = formData.get("especificacoes");
  let especificacoes: unknown = [];
  if (typeof rawEspecs === "string" && rawEspecs.trim() !== "") {
    try {
      especificacoes = JSON.parse(rawEspecs);
    } catch {
      return { message: "Erro ao processar especificações." };
    }
  }

  const parsed = ProdutoSchema.safeParse({
    nome: formData.get("nome"),
    codigo: formData.get("codigo"),
    tipo: formData.get("tipo"),
    sabor: formData.get("sabor"),
    especificacoes,
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  const { especificacoes: especs, ...produtoData } = parsed.data;

  let created;
  try {
    created = await prisma.produto.create({
      data: {
        ...produtoData,
        especificacoes: { create: especs },
      },
    });
  } catch (e) {
    const msg = (e as { code?: string }).code === "P2002"
      ? "Já existe um produto com este código."
      : "Erro ao criar produto.";
    return { message: msg };
  }

  await auditLog({
    action: "CREATE",
    entity: "Produto",
    entityId: created.id,
    diff: { ...produtoData, especificacoesCount: especs.length },
  });
  revalidatePath("/produtos");
  return { ok: true };
}

const ProdutoBaseSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").trim(),
  codigo: z.string().min(1, "Código obrigatório").trim().transform((s) => s.toUpperCase()),
  tipo: z.enum(TIPOS_VALIDOS),
  sabor: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
});

export async function atualizarProduto(
  _prev: ProdutoFormState,
  formData: FormData,
): Promise<ProdutoFormState> {
  await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { message: "ID inválido." };

  const parsed = ProdutoBaseSchema.safeParse({
    nome: formData.get("nome"),
    codigo: formData.get("codigo"),
    tipo: formData.get("tipo"),
    sabor: formData.get("sabor"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  try {
    await prisma.produto.update({ where: { id }, data: parsed.data });
  } catch (e) {
    const msg = (e as { code?: string }).code === "P2002"
      ? "Já existe outro produto com este código."
      : "Erro ao atualizar produto.";
    return { message: msg };
  }

  await auditLog({ action: "UPDATE", entity: "Produto", entityId: id, diff: parsed.data });
  revalidatePath("/produtos");
  return { ok: true };
}

export async function excluirProduto(id: string) {
  await requireUser();
  let removed;
  try {
    removed = await prisma.produto.delete({ where: { id } });
  } catch {
    return { message: "Não foi possível excluir (produto pode ter amostras vinculadas)." };
  }
  await auditLog({
    action: "DELETE",
    entity: "Produto",
    entityId: id,
    diff: { codigo: removed.codigo, nome: removed.nome },
  });
  revalidatePath("/produtos");
  return { ok: true };
}
