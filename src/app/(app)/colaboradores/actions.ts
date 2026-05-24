"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const ColaboradorSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório").trim(),
  cargo: z.string().min(2, "Cargo obrigatório").trim(),
  setor: z.string().min(2, "Setor obrigatório").trim(),
  email: z.string().email("Email inválido").trim().optional().or(z.literal("").transform(() => undefined)),
});

export type ColaboradorFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

export async function criarColaborador(
  _prev: ColaboradorFormState,
  formData: FormData,
): Promise<ColaboradorFormState> {
  await requireUser();

  const parsed = ColaboradorSchema.safeParse({
    nome: formData.get("nome"),
    cargo: formData.get("cargo"),
    setor: formData.get("setor"),
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  let created;
  try {
    created = await prisma.colaborador.create({ data: parsed.data });
  } catch {
    return { message: "Erro ao criar colaborador." };
  }

  await auditLog({ action: "CREATE", entity: "Colaborador", entityId: created.id, diff: parsed.data });
  revalidatePath("/colaboradores");
  revalidatePath("/treinamentos");
  return { ok: true };
}

export async function alternarAtivo(id: string, ativo: boolean) {
  await requireUser();
  await prisma.colaborador.update({ where: { id }, data: { ativo } });
  await auditLog({ action: "UPDATE", entity: "Colaborador", entityId: id, diff: { ativo } });
  revalidatePath("/colaboradores");
  revalidatePath("/treinamentos");
  return { ok: true };
}

export async function excluirColaborador(id: string) {
  await requireUser();
  try {
    await prisma.colaborador.delete({ where: { id } });
  } catch {
    return { message: "Erro ao excluir. Pode haver treinamentos vinculados." };
  }
  await auditLog({ action: "DELETE", entity: "Colaborador", entityId: id });
  revalidatePath("/colaboradores");
  return { ok: true };
}
