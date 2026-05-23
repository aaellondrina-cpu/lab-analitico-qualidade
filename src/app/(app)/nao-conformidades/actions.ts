"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const ACOES = ["LIBERAR", "RETER", "REPROCESSAR", "DESCARTE", "REVISAR"] as const;

const TratarSchema = z.object({
  causaRaiz: z.string().min(3, "Descreva a causa raiz").trim(),
  acao: z.enum(ACOES),
  acaoCorretiva: z.string().min(3, "Descreva a ação corretiva").trim(),
});

export type TratarNCState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

export async function iniciarTratamento(
  id: string,
  _prev: TratarNCState,
  formData: FormData,
): Promise<TratarNCState> {
  await requireUser();

  const parsed = TratarSchema.safeParse({
    causaRaiz: formData.get("causaRaiz"),
    acao: formData.get("acao"),
    acaoCorretiva: formData.get("acaoCorretiva"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  await prisma.naoConformidade.update({
    where: { id },
    data: { ...parsed.data, status: "EM_TRATAMENTO" },
  });
  await auditLog({ action: "UPDATE", entity: "NaoConformidade", entityId: id, diff: parsed.data });
  revalidatePath("/nao-conformidades");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function encerrarNC(id: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "RESPONSAVEL_TECNICO") {
    return { message: "Apenas Responsável Técnico ou Admin podem encerrar NCs." };
  }
  await prisma.naoConformidade.update({ where: { id }, data: { status: "ENCERRADA" } });
  await auditLog({ action: "UPDATE", entity: "NaoConformidade", entityId: id, diff: { status: "ENCERRADA" } });
  revalidatePath("/nao-conformidades");
  revalidatePath("/dashboard");
  return { ok: true };
}
