"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const CANAIS = ["EMAIL", "TELEFONE", "WHATSAPP", "PRESENCIAL", "PORTAL"] as const;
const TIPOS = ["QUALIDADE", "CORPO_ESTRANHO", "EMBALAGEM", "VALIDADE", "ROTULAGEM", "ATRASO", "DOCUMENTACAO", "OUTRO"] as const;
const URGENCIAS = ["BAIXA", "MEDIA", "ALTA", "CRITICA"] as const;
const STATUS = ["ABERTA", "EM_INVESTIGACAO", "AGUARDANDO_RETORNO", "ENCERRADA"] as const;

const PRAZO_DIAS: Record<(typeof URGENCIAS)[number], number> = {
  CRITICA: 1, ALTA: 2, MEDIA: 5, BAIXA: 10,
};

const strOpt = z.union([z.literal(""), z.string()]).transform((v) => (!v || !v.trim() ? undefined : v.trim()));

const Schema = z.object({
  clienteId: z.string().min(1, "Cliente obrigatório"),
  canal: z.enum(CANAIS),
  tipo: z.enum(TIPOS),
  urgencia: z.enum(URGENCIAS).default("MEDIA"),
  produto: strOpt,
  lote: strOpt,
  descricao: z.string().min(5, "Descreva a reclamação").trim(),
  evidenciaUrl: strOpt,
});

export type SACFormState = { errors?: Record<string, string[]>; message?: string };

async function gerarNumero(): Promise<string> {
  const ano = new Date().getFullYear();
  const prefix = `SAC-${ano}-`;
  const ult = await prisma.sAC.findFirst({ where: { numero: { startsWith: prefix } }, orderBy: { numero: "desc" } });
  const seq = ult ? parseInt(ult.numero.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(3, "0")}`;
}

export async function criarSAC(_prev: SACFormState, formData: FormData): Promise<SACFormState> {
  await requireUser();

  const parsed = Schema.safeParse({
    clienteId: formData.get("clienteId"),
    canal: formData.get("canal"),
    tipo: formData.get("tipo"),
    urgencia: formData.get("urgencia") ?? "MEDIA",
    produto: formData.get("produto"),
    lote: formData.get("lote"),
    descricao: formData.get("descricao"),
    evidenciaUrl: formData.get("evidenciaUrl"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: "Confira os campos." };
  }

  const prazo = new Date();
  prazo.setDate(prazo.getDate() + PRAZO_DIAS[parsed.data.urgencia]);

  await prisma.sAC.create({
    data: { ...parsed.data, numero: await gerarNumero(), prazo },
  });

  revalidatePath("/sac");
  redirect("/sac");
}

export async function atualizarStatusSAC(id: string, status: (typeof STATUS)[number]) {
  await requireUser();
  await prisma.sAC.update({ where: { id }, data: { status } });
  revalidatePath("/sac");
  return { ok: true };
}
