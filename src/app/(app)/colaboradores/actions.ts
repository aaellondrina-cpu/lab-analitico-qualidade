"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const ROLES = ["ADMIN", "RT", "ANALISTA", "OPERADOR", "LEITURA"] as const;
const APTIDOES = ["APTO", "APTO_COM_RESTRICOES", "INAPTO"] as const;

const strOpt = z.union([z.literal(""), z.string()]).transform((v) => (!v || !v.trim() ? undefined : v.trim()));
const dateOpt = z.union([z.literal(""), z.string()]).transform((v) => (!v ? undefined : new Date(v)));

const ColaboradorSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório").trim(),
  cargo: z.string().min(2, "Cargo obrigatório").trim(),
  setor: z.string().min(2, "Setor obrigatório").trim(),
  email: z.string().email("Email inválido").trim().optional().or(z.literal("").transform(() => undefined)),
  cpf: strOpt,
  telefone: strOpt,
  dataAdmissao: dateOpt,
  role: z.enum(ROLES).default("ANALISTA"),
  proximoExame: dateOpt,
  aptidao: z.enum(APTIDOES).default("APTO"),
  equipamentos: strOpt,
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
    cpf: formData.get("cpf"),
    telefone: formData.get("telefone"),
    dataAdmissao: formData.get("dataAdmissao") ?? "",
    role: formData.get("role") ?? "ANALISTA",
    proximoExame: formData.get("proximoExame") ?? "",
    aptidao: formData.get("aptidao") ?? "APTO",
    equipamentos: formData.get("equipamentos"),
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
