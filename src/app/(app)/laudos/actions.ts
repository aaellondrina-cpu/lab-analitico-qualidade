"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const CONCLUSOES = ["APROVADO", "REPROVADO", "APROVADO_COM_RESTRICOES"] as const;

const EmitirLaudoSchema = z.object({
  amostraId: z.string().min(1),
  conclusao: z.enum(CONCLUSOES),
  observacoes: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
});

export type EmitirLaudoState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
  laudoId?: string;
};

async function gerarNumeroLaudo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `L-${year}-`;
  const last = await prisma.laudo.findFirst({
    where: { numero: { startsWith: prefix } },
    orderBy: { numero: "desc" },
  });
  const nextSeq = last ? parseInt(last.numero.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

export async function emitirLaudo(
  _prev: EmitirLaudoState,
  formData: FormData,
): Promise<EmitirLaudoState> {
  const user = await requireRole("RESPONSAVEL_TECNICO");

  const parsed = EmitirLaudoSchema.safeParse({
    amostraId: formData.get("amostraId"),
    conclusao: formData.get("conclusao"),
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  const amostra = await prisma.amostra.findUnique({
    where: { id: parsed.data.amostraId },
    select: { id: true, status: true, laudo: { select: { id: true } } },
  });

  if (!amostra) return { message: "Amostra não encontrada." };
  if (amostra.laudo) return { message: "Esta amostra já tem laudo emitido.", laudoId: amostra.laudo.id };
  if (amostra.status !== "APROVADO") {
    return { message: "Amostra precisa estar APROVADA antes de emitir laudo." };
  }

  const numero = await gerarNumeroLaudo();
  const qrToken = randomUUID();

  const laudo = await prisma.$transaction(async (tx) => {
    const created = await tx.laudo.create({
      data: {
        numero,
        amostraId: parsed.data.amostraId,
        conclusao: parsed.data.conclusao,
        observacoes: parsed.data.observacoes,
        emitidoPorId: user.id,
        emitidoPorNome: user.name ?? user.email ?? "—",
        emitidoPorRole: user.role ?? "RESPONSAVEL_TECNICO",
        qrToken,
      },
    });
    await tx.amostra.update({
      where: { id: parsed.data.amostraId },
      data: { status: "LAUDO_EMITIDO" },
    });
    return created;
  });

  await auditLog({
    action: "SIGN",
    entity: "Laudo",
    entityId: laudo.id,
    diff: { numero, conclusao: parsed.data.conclusao, amostraId: parsed.data.amostraId },
  });

  revalidatePath("/laudos");
  revalidatePath(`/amostras/${parsed.data.amostraId}`);
  redirect(`/laudos/${laudo.id}`);
}
