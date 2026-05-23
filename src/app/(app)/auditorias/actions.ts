"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const TIPOS = ["INTERNA", "EXTERNA"] as const;
const NORMAS = ["BPF", "ISO_22000", "FSSC_22000", "ISO_17025", "ANVISA", "MAPA", "INTERNA"] as const;
const ORGAOS = ["ANVISA", "MAPA", "INMETRO", "VIG_SANITARIA", "CLIENTE", "CERTIFICADORA"] as const;
const STATUS = ["PLANEJADA", "EM_ANDAMENTO", "CONCLUIDA", "AGUARDANDO_VERIFICACAO"] as const;
const RESULTADOS = ["APROVADO", "APROVADO_COM_RESSALVAS", "REPROVADO"] as const;
const ITEM_RESULTADOS = ["CONFORME", "NAO_CONFORME", "NAO_APLICAVEL", "OBSERVACAO"] as const;

const strOpt = z
  .union([z.literal(""), z.string()])
  .transform((v) => (!v || !v.trim() ? undefined : v.trim()));

const dateOpt = z
  .union([z.literal(""), z.string()])
  .transform((v) => (!v ? undefined : new Date(v)));

const AuditoriaSchema = z
  .object({
    tipo: z.enum(TIPOS),
    norma: z.enum(NORMAS),
    orgao: strOpt,
    auditorNome: z.string().min(2, "Auditor obrigatório").trim(),
    auditorCredencial: strOpt,
    dataInicio: z.string().min(1, "Data início obrigatória").transform((s) => new Date(s)),
    dataFim: dateOpt,
    areas: z.array(z.string()).optional().default([]),
    status: z.enum(STATUS).default("PLANEJADA"),
    observacoes: strOpt,
    prazoResposta: dateOpt,
    relatorioUrl: strOpt,
  })
  .refine(
    (v) => v.tipo === "INTERNA" || (v.orgao && ORGAOS.includes(v.orgao as (typeof ORGAOS)[number])),
    { message: "Órgão é obrigatório para auditoria externa", path: ["orgao"] },
  );

export type AuditoriaFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
  id?: string;
};

async function gerarNumeroAuditoria(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `AUD-${year}-`;
  const last = await prisma.auditoria.findFirst({
    where: { numero: { startsWith: prefix } },
    orderBy: { numero: "desc" },
  });
  const nextSeq = last ? parseInt(last.numero.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

export async function criarAuditoria(
  _prev: AuditoriaFormState,
  formData: FormData,
): Promise<AuditoriaFormState> {
  await requireUser();

  const areas = formData.getAll("areas").map(String).filter(Boolean);

  const parsed = AuditoriaSchema.safeParse({
    tipo: formData.get("tipo"),
    norma: formData.get("norma"),
    orgao: formData.get("orgao"),
    auditorNome: formData.get("auditorNome"),
    auditorCredencial: formData.get("auditorCredencial"),
    dataInicio: formData.get("dataInicio"),
    dataFim: formData.get("dataFim"),
    areas,
    status: formData.get("status") ?? "PLANEJADA",
    observacoes: formData.get("observacoes"),
    prazoResposta: formData.get("prazoResposta"),
    relatorioUrl: formData.get("relatorioUrl"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  const numero = await gerarNumeroAuditoria();
  const created = await prisma.auditoria.create({
    data: {
      ...parsed.data,
      numero,
      areas: parsed.data.areas.join(","),
    },
  });

  await auditLog({
    action: "CREATE",
    entity: "Auditoria",
    entityId: created.id,
    diff: { numero, tipo: parsed.data.tipo, norma: parsed.data.norma },
  });

  revalidatePath("/auditorias");
  redirect(`/auditorias/${created.id}`);
}

export async function atualizarStatusAuditoria(id: string, status: (typeof STATUS)[number]) {
  await requireUser();
  if (!STATUS.includes(status)) return { message: "Status inválido." };
  try {
    await prisma.auditoria.update({ where: { id }, data: { status } });
  } catch {
    return { message: "Erro ao atualizar status." };
  }
  await auditLog({ action: "UPDATE", entity: "Auditoria", entityId: id, diff: { status } });
  revalidatePath(`/auditorias/${id}`);
  revalidatePath("/auditorias");
  return { ok: true };
}

export async function atualizarResultadoAuditoria(
  id: string,
  resultado: (typeof RESULTADOS)[number] | "",
) {
  await requireUser();
  const res = resultado === "" ? null : resultado;
  if (res !== null && !RESULTADOS.includes(res)) return { message: "Resultado inválido." };
  try {
    await prisma.auditoria.update({ where: { id }, data: { resultado: res } });
  } catch {
    return { message: "Erro ao atualizar resultado." };
  }
  await auditLog({ action: "UPDATE", entity: "Auditoria", entityId: id, diff: { resultado: res } });
  revalidatePath(`/auditorias/${id}`);
  return { ok: true };
}

export async function excluirAuditoria(id: string) {
  await requireUser();
  try {
    const removed = await prisma.auditoria.delete({ where: { id } });
    await auditLog({
      action: "DELETE",
      entity: "Auditoria",
      entityId: id,
      diff: { numero: removed.numero },
    });
  } catch {
    return { message: "Erro ao excluir auditoria." };
  }
  revalidatePath("/auditorias");
  return { ok: true };
}

const ItemSchema = z.object({
  auditoriaId: z.string().min(1),
  area: z.string().min(1, "Área obrigatória").trim(),
  item: z.string().min(2, "Descrição obrigatória").trim(),
  resultado: z.enum(ITEM_RESULTADOS),
  observacao: strOpt,
  ncId: strOpt,
});

export type ItemFormState = AuditoriaFormState;

export async function adicionarItem(
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  await requireUser();

  const parsed = ItemSchema.safeParse({
    auditoriaId: formData.get("auditoriaId"),
    area: formData.get("area"),
    item: formData.get("item"),
    resultado: formData.get("resultado"),
    observacao: formData.get("observacao"),
    ncId: formData.get("ncId"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  try {
    await prisma.itemAuditoria.create({ data: parsed.data });
  } catch {
    return { message: "Erro ao adicionar item (NC já vinculada a outro item?)." };
  }

  await auditLog({
    action: "CREATE",
    entity: "ItemAuditoria",
    diff: { auditoriaId: parsed.data.auditoriaId, area: parsed.data.area, resultado: parsed.data.resultado },
  });

  revalidatePath(`/auditorias/${parsed.data.auditoriaId}`);
  return { ok: true };
}

export async function excluirItem(itemId: string, auditoriaId: string) {
  await requireUser();
  try {
    await prisma.itemAuditoria.delete({ where: { id: itemId } });
  } catch {
    return { message: "Erro ao excluir item." };
  }
  await auditLog({ action: "DELETE", entity: "ItemAuditoria", entityId: itemId });
  revalidatePath(`/auditorias/${auditoriaId}`);
  return { ok: true };
}
