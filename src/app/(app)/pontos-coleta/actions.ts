"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const TIPOS_VALIDOS = ["MATERIA_PRIMA", "PROCESSO", "PRODUTO_ACABADO", "AGUA", "CIP", "AMBIENTE"] as const;

const PontoSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").trim(),
  tipo: z.enum(TIPOS_VALIDOS),
  localizacao: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
});

export type PontoFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

export async function criarPontoColeta(
  _prev: PontoFormState,
  formData: FormData,
): Promise<PontoFormState> {
  await requireUser();

  const parsed = PontoSchema.safeParse({
    nome: formData.get("nome"),
    tipo: formData.get("tipo"),
    localizacao: formData.get("localizacao"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  const created = await prisma.pontoColeta.create({ data: parsed.data });
  await auditLog({ action: "CREATE", entity: "PontoColeta", entityId: created.id, diff: parsed.data });
  revalidatePath("/pontos-coleta");
  return { ok: true };
}

export async function excluirPontoColeta(id: string) {
  await requireUser();
  let removed;
  try {
    removed = await prisma.pontoColeta.delete({ where: { id } });
  } catch {
    return { message: "Não foi possível excluir (ponto pode ter amostras vinculadas)." };
  }
  await auditLog({ action: "DELETE", entity: "PontoColeta", entityId: id, diff: { nome: removed.nome } });
  revalidatePath("/pontos-coleta");
  return { ok: true };
}
