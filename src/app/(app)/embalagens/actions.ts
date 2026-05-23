"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const TIPOS = ["PET", "VIDRO_RETORNAVEL", "VIDRO_NAO_RETORNAVEL", "LATA", "TAMPA", "ROTULO"] as const;
const STATUS = ["EM_ANALISE", "APROVADA", "REPROVADA", "DESCARTE"] as const;

const opt = (msg: string) =>
  z
    .union([z.literal(""), z.string()])
    .transform((v) => (v === "" || v == null ? undefined : Number(v)))
    .refine((v) => v === undefined || (!Number.isNaN(v) && v >= 0), msg);

const EmbalagemSchema = z.object({
  tipo: z.enum(TIPOS),
  fornecedor: z.string().min(2, "Fornecedor obrigatório").trim(),
  loteFornecedor: z.string().min(1, "Lote do fornecedor obrigatório").trim(),
  volumeNominalMl: opt("Volume inválido"),
  pesoGramas: opt("Peso inválido"),
  espessuraMm: opt("Espessura inválida"),
  resistenciaBar: opt("Resistência inválida"),
  torqueNcm: opt("Torque inválido"),
  numeroTrips: opt("Trips inválido"),
  status: z.enum(STATUS).default("EM_ANALISE"),
  observacoes: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
});

export type EmbalagemFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

export async function criarEmbalagem(
  _prev: EmbalagemFormState,
  formData: FormData,
): Promise<EmbalagemFormState> {
  await requireUser();

  const parsed = EmbalagemSchema.safeParse({
    tipo: formData.get("tipo"),
    fornecedor: formData.get("fornecedor"),
    loteFornecedor: formData.get("loteFornecedor"),
    volumeNominalMl: formData.get("volumeNominalMl"),
    pesoGramas: formData.get("pesoGramas"),
    espessuraMm: formData.get("espessuraMm"),
    resistenciaBar: formData.get("resistenciaBar"),
    torqueNcm: formData.get("torqueNcm"),
    numeroTrips: formData.get("numeroTrips"),
    status: formData.get("status") ?? "EM_ANALISE",
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  const data = {
    ...parsed.data,
    numeroTrips: parsed.data.numeroTrips !== undefined ? Math.trunc(parsed.data.numeroTrips) : undefined,
  };

  let created;
  try {
    created = await prisma.embalagem.create({ data });
  } catch {
    return { message: "Erro ao registrar embalagem." };
  }

  await auditLog({ action: "CREATE", entity: "Embalagem", entityId: created.id, diff: data });
  revalidatePath("/embalagens");
  return { ok: true };
}

export async function atualizarStatusEmbalagem(id: string, status: (typeof STATUS)[number]) {
  await requireUser();
  if (!STATUS.includes(status)) return { message: "Status inválido." };
  try {
    await prisma.embalagem.update({ where: { id }, data: { status } });
  } catch {
    return { message: "Erro ao atualizar status." };
  }
  await auditLog({ action: "UPDATE", entity: "Embalagem", entityId: id, diff: { status } });
  revalidatePath("/embalagens");
  return { ok: true };
}

export async function excluirEmbalagem(id: string) {
  await requireUser();
  let removed;
  try {
    removed = await prisma.embalagem.delete({ where: { id } });
  } catch {
    return { message: "Não foi possível excluir (embalagem pode ter amostras vinculadas)." };
  }
  await auditLog({
    action: "DELETE",
    entity: "Embalagem",
    entityId: id,
    diff: { tipo: removed.tipo, loteFornecedor: removed.loteFornecedor },
  });
  revalidatePath("/embalagens");
  return { ok: true };
}
