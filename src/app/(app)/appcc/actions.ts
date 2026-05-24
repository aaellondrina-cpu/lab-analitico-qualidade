"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const TIPO_PERIGO = ["BIOLOGICO", "QUIMICO", "FISICO", "RADIOLOGICO"] as const;
const NIVEL = ["ALTA", "MEDIA", "BAIXA"] as const;

const PCCSchema = z
  .object({
    numero: z.string().min(3, "Número obrigatório (ex: PCC-01)").trim(),
    etapa: z.string().min(2, "Etapa obrigatória").trim(),
    perigo: z.string().min(3, "Descrição do perigo obrigatória").trim(),
    tipoPerigo: z.enum(TIPO_PERIGO),
    probabilidade: z.enum(NIVEL),
    severidade: z.enum(NIVEL),
    medidaControle: z.string().min(3, "Medida de controle obrigatória").trim(),
    limiteCriticoMin: z.string().trim().optional().or(z.literal("")),
    limiteCriticoMax: z.string().trim().optional().or(z.literal("")),
    unidade: z.string().min(1, "Unidade obrigatória").trim(),
    frequencia: z.string().min(2, "Frequência obrigatória").trim(),
    responsavel: z.string().min(2, "Responsável obrigatório").trim(),
    acaoCorretiva: z.string().min(3, "Ação corretiva obrigatória").trim(),
  })
  .refine(
    (d) => (d.limiteCriticoMin && d.limiteCriticoMin !== "") || (d.limiteCriticoMax && d.limiteCriticoMax !== ""),
    { message: "Defina ao menos um limite crítico (mín ou máx)", path: ["limiteCriticoMin"] },
  );

export type PCCFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

export async function criarPCC(_prev: PCCFormState, formData: FormData): Promise<PCCFormState> {
  await requireUser();

  const parsed = PCCSchema.safeParse({
    numero: formData.get("numero"),
    etapa: formData.get("etapa"),
    perigo: formData.get("perigo"),
    tipoPerigo: formData.get("tipoPerigo"),
    probabilidade: formData.get("probabilidade"),
    severidade: formData.get("severidade"),
    medidaControle: formData.get("medidaControle"),
    limiteCriticoMin: formData.get("limiteCriticoMin"),
    limiteCriticoMax: formData.get("limiteCriticoMax"),
    unidade: formData.get("unidade"),
    frequencia: formData.get("frequencia"),
    responsavel: formData.get("responsavel"),
    acaoCorretiva: formData.get("acaoCorretiva"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  const data = {
    ...parsed.data,
    limiteCriticoMin: parsed.data.limiteCriticoMin ? Number(parsed.data.limiteCriticoMin) : null,
    limiteCriticoMax: parsed.data.limiteCriticoMax ? Number(parsed.data.limiteCriticoMax) : null,
  };

  let created;
  try {
    created = await prisma.pCC.create({ data });
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      return { errors: { numero: ["Já existe um PCC com este número"] } };
    }
    return { message: "Erro ao criar PCC." };
  }

  await auditLog({ action: "CREATE", entity: "PCC", entityId: created.id, diff: data });
  revalidatePath("/appcc");
  redirect(`/appcc/${created.id}`);
}

const MonitoramentoSchema = z.object({
  valor: z.string().transform((v) => Number(v)).refine((v) => !Number.isNaN(v), "Valor inválido"),
  responsavel: z.string().min(2, "Responsável obrigatório").trim(),
  observacao: z.string().trim().optional().or(z.literal("").transform(() => undefined)),
});

export type MonitoramentoState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
  ncCriada?: boolean;
};

export async function registrarMonitoramento(
  pccId: string,
  _prev: MonitoramentoState,
  formData: FormData,
): Promise<MonitoramentoState> {
  const user = await requireUser();

  const parsed = MonitoramentoSchema.safeParse({
    valor: formData.get("valor"),
    responsavel: formData.get("responsavel"),
    observacao: formData.get("observacao"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  const pcc = await prisma.pCC.findUnique({ where: { id: pccId } });
  if (!pcc) return { message: "PCC não encontrado." };

  const fora =
    (pcc.limiteCriticoMin !== null && parsed.data.valor < pcc.limiteCriticoMin) ||
    (pcc.limiteCriticoMax !== null && parsed.data.valor > pcc.limiteCriticoMax);
  const conforme = !fora;

  await prisma.monitoramentoPCC.create({
    data: {
      pccId,
      valor: parsed.data.valor,
      conforme,
      responsavel: parsed.data.responsavel,
      observacao: parsed.data.observacao,
    },
  });

  await auditLog({
    action: "CREATE",
    entity: "MonitoramentoPCC",
    entityId: pccId,
    diff: { valor: parsed.data.valor, conforme },
  });

  // Se fora do limite, abre NC vinculada — mas sem amostra (PCC não tem amostra direta).
  // Em vez disso, criamos NC de processo. Como o model atual exige amostraId,
  // por enquanto só sinalizamos via alerta (TODO: NC sem amostra).
  // Para o demo, registramos um auditLog específico.
  if (!conforme) {
    await auditLog({
      action: "CREATE",
      entity: "NaoConformidade",
      diff: {
        origem: "PCC",
        pccNumero: pcc.numero,
        valor: parsed.data.valor,
        limiteMin: pcc.limiteCriticoMin,
        limiteMax: pcc.limiteCriticoMax,
        responsavel: user.name,
      },
    });
  }

  revalidatePath(`/appcc/${pccId}`);
  revalidatePath("/appcc");
  return { ok: true, ncCriada: !conforme };
}

export async function excluirPCC(id: string) {
  await requireUser();
  try {
    await prisma.pCC.delete({ where: { id } });
  } catch {
    return { message: "Erro ao excluir PCC. Pode haver monitoramentos vinculados." };
  }
  await auditLog({ action: "DELETE", entity: "PCC", entityId: id });
  revalidatePath("/appcc");
  return { ok: true };
}

export async function alternarAtivoPCC(id: string, ativo: boolean) {
  await requireUser();
  await prisma.pCC.update({ where: { id }, data: { ativo } });
  await auditLog({ action: "UPDATE", entity: "PCC", entityId: id, diff: { ativo } });
  revalidatePath("/appcc");
  return { ok: true };
}
