"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const EquipamentoSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório").trim(),
  modelo: z.string().min(1, "Modelo obrigatório").trim(),
  numeroSerie: z.string().min(1, "Nº de série obrigatório").trim(),
  fabricante: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  ultimaCalibracao: z.string().min(1, "Data última calibração obrigatória").transform((s) => new Date(s)),
  proximaCalibracao: z.string().min(1, "Data próxima calibração obrigatória").transform((s) => new Date(s)),
  certificadoUrl: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
});

export type EquipamentoFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

function statusFromDates(proximaCalibracao: Date): string {
  const now = new Date();
  const trintaDias = new Date(now);
  trintaDias.setDate(trintaDias.getDate() + 30);
  if (proximaCalibracao < now) return "VENCIDO";
  if (proximaCalibracao < trintaDias) return "PROXIMO_VENCIMENTO";
  return "CALIBRADO";
}

export async function criarEquipamento(
  _prev: EquipamentoFormState,
  formData: FormData,
): Promise<EquipamentoFormState> {
  await requireUser();

  const parsed = EquipamentoSchema.safeParse({
    nome: formData.get("nome"),
    modelo: formData.get("modelo"),
    numeroSerie: formData.get("numeroSerie"),
    fabricante: formData.get("fabricante"),
    ultimaCalibracao: formData.get("ultimaCalibracao"),
    proximaCalibracao: formData.get("proximaCalibracao"),
    certificadoUrl: formData.get("certificadoUrl"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  if (parsed.data.proximaCalibracao <= parsed.data.ultimaCalibracao) {
    return { errors: { proximaCalibracao: ["Próxima calibração deve ser depois da última"] } };
  }

  const status = statusFromDates(parsed.data.proximaCalibracao);

  let created;
  try {
    created = await prisma.equipamento.create({ data: { ...parsed.data, status } });
  } catch (e) {
    const msg = (e as { code?: string }).code === "P2002"
      ? "Já existe um equipamento com este nº de série."
      : "Erro ao criar equipamento.";
    return { message: msg };
  }

  await auditLog({ action: "CREATE", entity: "Equipamento", entityId: created.id, diff: parsed.data });
  revalidatePath("/equipamentos");
  return { ok: true };
}

export async function recalcularStatusEquipamentos() {
  await requireUser();
  const all = await prisma.equipamento.findMany();
  for (const e of all) {
    const s = statusFromDates(e.proximaCalibracao);
    if (s !== e.status) {
      await prisma.equipamento.update({ where: { id: e.id }, data: { status: s } });
    }
  }
  revalidatePath("/equipamentos");
  return { ok: true };
}

export async function excluirEquipamento(id: string) {
  await requireUser();
  let removed;
  try {
    removed = await prisma.equipamento.delete({ where: { id } });
  } catch {
    return { message: "Não foi possível excluir (equipamento pode ter resultados vinculados)." };
  }
  await auditLog({ action: "DELETE", entity: "Equipamento", entityId: id, diff: { nome: removed.nome, serie: removed.numeroSerie } });
  revalidatePath("/equipamentos");
  return { ok: true };
}
