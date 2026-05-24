"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const TIPOS = ["POP", "ITP", "FORMULARIO", "MANUAL", "PROCEDIMENTO", "ESPECIFICACAO"] as const;
const STATUSES = ["VIGENTE", "EM_REVISAO", "OBSOLETO"] as const;

const DocumentoSchema = z.object({
  codigo: z.string().min(2, "Código obrigatório").trim(),
  titulo: z.string().min(3, "Título obrigatório").trim(),
  tipo: z.enum(TIPOS),
  versao: z.string().min(1, "Versão obrigatória").trim(),
  arquivoUrl: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  status: z.enum(STATUSES).default("VIGENTE"),
  aprovadoPor: z.string().min(2, "Aprovador obrigatório").trim(),
  dataAprovacao: z.string().min(1, "Data de aprovação obrigatória"),
  revisaoEm: z.string().trim().optional().or(z.literal("")),
  observacoes: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
  versaoAnteriorId: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
});

export type DocumentoFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

export async function criarDocumento(
  _prev: DocumentoFormState,
  formData: FormData,
): Promise<DocumentoFormState> {
  await requireUser();

  const parsed = DocumentoSchema.safeParse({
    codigo: formData.get("codigo"),
    titulo: formData.get("titulo"),
    tipo: formData.get("tipo"),
    versao: formData.get("versao"),
    arquivoUrl: formData.get("arquivoUrl"),
    status: formData.get("status") ?? "VIGENTE",
    aprovadoPor: formData.get("aprovadoPor"),
    dataAprovacao: formData.get("dataAprovacao"),
    revisaoEm: formData.get("revisaoEm"),
    observacoes: formData.get("observacoes"),
    versaoAnteriorId: formData.get("versaoAnteriorId"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  const data = {
    codigo: parsed.data.codigo,
    titulo: parsed.data.titulo,
    tipo: parsed.data.tipo,
    versao: parsed.data.versao,
    arquivoUrl: parsed.data.arquivoUrl,
    status: parsed.data.status,
    aprovadoPor: parsed.data.aprovadoPor,
    dataAprovacao: new Date(parsed.data.dataAprovacao),
    revisaoEm: parsed.data.revisaoEm ? new Date(parsed.data.revisaoEm) : null,
    observacoes: parsed.data.observacoes,
    versaoAnteriorId: parsed.data.versaoAnteriorId,
  };

  let created;
  try {
    created = await prisma.documento.create({ data });
    // Se aponta para uma versão anterior, marca a anterior como OBSOLETO
    if (data.versaoAnteriorId) {
      await prisma.documento.update({
        where: { id: data.versaoAnteriorId },
        data: { status: "OBSOLETO" },
      });
    }
  } catch {
    return { message: "Erro ao criar documento." };
  }

  await auditLog({ action: "CREATE", entity: "Documento", entityId: created.id, diff: data });
  revalidatePath("/documentos");
  return { ok: true };
}

export async function excluirDocumento(id: string) {
  await requireUser();
  try {
    await prisma.documento.delete({ where: { id } });
  } catch {
    return { message: "Erro ao excluir. Pode haver treinamentos vinculados." };
  }
  await auditLog({ action: "DELETE", entity: "Documento", entityId: id });
  revalidatePath("/documentos");
  return { ok: true };
}
