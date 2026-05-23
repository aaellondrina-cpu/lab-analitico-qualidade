"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const STATUS = ["APROVADO", "REPROCESSAR"] as const;

const CIPSchema = z.object({
  alvo: z.string().min(2, "Alvo obrigatório").trim(),
  responsavel: z.string().min(2, "Responsável obrigatório").trim(),
  concentracao: z
    .string()
    .transform((v) => Number(v))
    .refine((v) => !Number.isNaN(v) && v >= 0, "Concentração inválida"),
  temperatura: z
    .string()
    .transform((v) => Number(v))
    .refine((v) => !Number.isNaN(v), "Temperatura inválida"),
  tempoContatoMin: z
    .string()
    .transform((v) => Number(v))
    .refine((v) => !Number.isNaN(v) && v > 0, "Tempo deve ser maior que zero")
    .transform((v) => Math.trunc(v)),
  resultadoMicro: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  amostraId: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  status: z.enum(STATUS).default("APROVADO"),
  observacoes: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
});

export type CIPFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

export async function criarRegistroCIP(
  _prev: CIPFormState,
  formData: FormData,
): Promise<CIPFormState> {
  await requireUser();

  const parsed = CIPSchema.safeParse({
    alvo: formData.get("alvo"),
    responsavel: formData.get("responsavel"),
    concentracao: formData.get("concentracao"),
    temperatura: formData.get("temperatura"),
    tempoContatoMin: formData.get("tempoContatoMin"),
    resultadoMicro: formData.get("resultadoMicro"),
    amostraId: formData.get("amostraId"),
    status: formData.get("status") ?? "APROVADO",
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  let created;
  try {
    created = await prisma.registroCIP.create({ data: parsed.data });
  } catch {
    return { message: "Erro ao registrar CIP." };
  }

  await auditLog({ action: "CREATE", entity: "RegistroCIP", entityId: created.id, diff: parsed.data });
  revalidatePath("/cip");
  return { ok: true };
}

export async function excluirRegistroCIP(id: string) {
  await requireUser();
  try {
    await prisma.registroCIP.delete({ where: { id } });
  } catch {
    return { message: "Erro ao excluir registro." };
  }
  await auditLog({ action: "DELETE", entity: "RegistroCIP", entityId: id });
  revalidatePath("/cip");
  return { ok: true };
}
