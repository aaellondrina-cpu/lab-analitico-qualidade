"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const FornecedorSchema = z.object({
  razaoSocial: z.string().min(2, "Razão social muito curta").trim(),
  cnpj: z
    .string()
    .trim()
    .min(14, "CNPJ deve ter 14 dígitos")
    .transform((s) => s.replace(/\D/g, ""))
    .refine((s) => s.length === 14, "CNPJ deve ter 14 dígitos"),
  responsavel: z.string().min(2, "Responsável obrigatório").trim(),
  email: z.email("E-mail inválido").trim(),
  telefone: z.string().min(8, "Telefone inválido").trim(),
  endereco: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  certificacoes: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
});

export type FornecedorFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

export async function criarFornecedor(
  _prev: FornecedorFormState,
  formData: FormData,
): Promise<FornecedorFormState> {
  await requireUser();

  const parsed = FornecedorSchema.safeParse({
    razaoSocial: formData.get("razaoSocial"),
    cnpj: formData.get("cnpj"),
    responsavel: formData.get("responsavel"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    endereco: formData.get("endereco"),
    certificacoes: formData.get("certificacoes"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  let created;
  try {
    created = await prisma.fornecedor.create({ data: parsed.data });
  } catch (e) {
    const msg = (e as { code?: string }).code === "P2002"
      ? "Já existe um fornecedor com este CNPJ."
      : "Erro ao criar fornecedor.";
    return { message: msg };
  }

  await auditLog({ action: "CREATE", entity: "Fornecedor", entityId: created.id, diff: parsed.data });
  revalidatePath("/fornecedores");
  return { ok: true };
}

export async function atualizarFornecedor(
  _prev: FornecedorFormState,
  formData: FormData,
): Promise<FornecedorFormState> {
  await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return { message: "ID inválido." };

  const parsed = FornecedorSchema.safeParse({
    razaoSocial: formData.get("razaoSocial"),
    cnpj: formData.get("cnpj"),
    responsavel: formData.get("responsavel"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
    endereco: formData.get("endereco"),
    certificacoes: formData.get("certificacoes"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  try {
    await prisma.fornecedor.update({ where: { id }, data: parsed.data });
  } catch (e) {
    const msg = (e as { code?: string }).code === "P2002"
      ? "Já existe outro fornecedor com este CNPJ."
      : "Erro ao atualizar fornecedor.";
    return { message: msg };
  }

  await auditLog({ action: "UPDATE", entity: "Fornecedor", entityId: id, diff: parsed.data });
  revalidatePath("/fornecedores");
  return { ok: true };
}

export async function excluirFornecedor(id: string) {
  await requireUser();
  let removed;
  try {
    removed = await prisma.fornecedor.delete({ where: { id } });
  } catch {
    return { message: "Não foi possível excluir (fornecedor pode ter insumos vinculados)." };
  }
  await auditLog({
    action: "DELETE",
    entity: "Fornecedor",
    entityId: id,
    diff: { razaoSocial: removed.razaoSocial, cnpj: removed.cnpj },
  });
  revalidatePath("/fornecedores");
  return { ok: true };
}
