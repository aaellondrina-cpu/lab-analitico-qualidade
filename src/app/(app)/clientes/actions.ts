"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const ClienteSchema = z.object({
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
});

export type ClienteFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

export async function criarCliente(
  _prev: ClienteFormState,
  formData: FormData,
): Promise<ClienteFormState> {
  await requireUser();

  const parsed = ClienteSchema.safeParse({
    razaoSocial: formData.get("razaoSocial"),
    cnpj: formData.get("cnpj"),
    responsavel: formData.get("responsavel"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  let created;
  try {
    created = await prisma.cliente.create({ data: parsed.data });
  } catch (e) {
    const msg = (e as { code?: string }).code === "P2002"
      ? "Já existe um cliente com este CNPJ."
      : "Erro ao criar cliente.";
    return { message: msg };
  }

  await auditLog({ action: "CREATE", entity: "Cliente", entityId: created.id, diff: parsed.data });
  revalidatePath("/clientes");
  return { ok: true };
}

export async function excluirCliente(id: string) {
  await requireUser();
  let removed;
  try {
    removed = await prisma.cliente.delete({ where: { id } });
  } catch {
    return { message: "Não foi possível excluir (cliente pode ter amostras vinculadas)." };
  }
  await auditLog({ action: "DELETE", entity: "Cliente", entityId: id, diff: { razaoSocial: removed.razaoSocial, cnpj: removed.cnpj } });
  revalidatePath("/clientes");
  return { ok: true };
}
