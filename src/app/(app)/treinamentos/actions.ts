"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const FORMAS = ["PRESENCIAL", "ONLINE", "ON_THE_JOB"] as const;

const TreinamentoSchema = z.object({
  colaboradorId: z.string().min(1, "Selecione um colaborador"),
  documentoId: z.string().min(1, "Selecione um documento"),
  dataRealizado: z.string().min(1, "Data obrigatória"),
  instrutor: z.string().min(2, "Instrutor obrigatório").trim(),
  forma: z.enum(FORMAS),
  validade: z.string().trim().optional().or(z.literal("")),
  evidenciaUrl: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  observacoes: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
});

export type TreinamentoFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

export async function registrarTreinamento(
  _prev: TreinamentoFormState,
  formData: FormData,
): Promise<TreinamentoFormState> {
  await requireUser();

  const parsed = TreinamentoSchema.safeParse({
    colaboradorId: formData.get("colaboradorId"),
    documentoId: formData.get("documentoId"),
    dataRealizado: formData.get("dataRealizado"),
    instrutor: formData.get("instrutor"),
    forma: formData.get("forma"),
    validade: formData.get("validade"),
    evidenciaUrl: formData.get("evidenciaUrl"),
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  const validade = parsed.data.validade ? new Date(parsed.data.validade) : null;
  const status =
    validade && validade.getTime() < Date.now() ? "VENCIDO" : "TREINADO";

  let created;
  try {
    created = await prisma.treinamento.create({
      data: {
        colaboradorId: parsed.data.colaboradorId,
        documentoId: parsed.data.documentoId,
        dataRealizado: new Date(parsed.data.dataRealizado),
        instrutor: parsed.data.instrutor,
        forma: parsed.data.forma,
        validade,
        status,
        evidenciaUrl: parsed.data.evidenciaUrl,
        observacoes: parsed.data.observacoes,
      },
    });
  } catch {
    return { message: "Erro ao registrar treinamento." };
  }

  await auditLog({
    action: "CREATE",
    entity: "Treinamento",
    entityId: created.id,
    diff: parsed.data,
  });
  revalidatePath("/treinamentos");
  return { ok: true };
}

export async function excluirTreinamento(id: string) {
  await requireUser();
  try {
    await prisma.treinamento.delete({ where: { id } });
  } catch {
    return { message: "Erro ao excluir treinamento." };
  }
  await auditLog({ action: "DELETE", entity: "Treinamento", entityId: id });
  revalidatePath("/treinamentos");
  return { ok: true };
}
