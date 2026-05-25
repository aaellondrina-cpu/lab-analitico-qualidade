"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const MOTIVOS = ["CONTAMINACAO", "NC_FISICOQUIMICA", "CORPO_ESTRANHO", "ROTULAGEM", "OUTRO"] as const;
const NIVEIS = ["CLASSE_I", "CLASSE_II", "CLASSE_III"] as const;

const strOpt = z.union([z.literal(""), z.string()]).transform((v) => (!v || !v.trim() ? undefined : v.trim()));

const Schema = z.object({
  lotesIds: z.string().min(1, "Selecione ao menos 1 lote"),
  motivo: z.enum(MOTIVOS),
  descricao: z.string().min(5, "Descreva o problema").trim(),
  nivel: z.enum(NIVEIS),
  responsavel: z.string().min(2, "Responsável obrigatório").trim(),
  dataIdentificacao: z.string().min(1, "Data obrigatória").transform((s) => new Date(s)),
  protocoloMAPA: strOpt,
});

export type RecallFormState = { errors?: Record<string, string[]>; message?: string };

async function gerarNumero(): Promise<string> {
  const ano = new Date().getFullYear();
  const prefix = `RC-${ano}-`;
  const ult = await prisma.recall.findFirst({ where: { numero: { startsWith: prefix } }, orderBy: { numero: "desc" } });
  const seq = ult ? parseInt(ult.numero.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(3, "0")}`;
}

export async function criarRecall(_prev: RecallFormState, formData: FormData): Promise<RecallFormState> {
  await requireUser();

  const lotesArr = formData.getAll("lotes").map(String).filter(Boolean);

  const parsed = Schema.safeParse({
    lotesIds: lotesArr.join(","),
    motivo: formData.get("motivo"),
    descricao: formData.get("descricao"),
    nivel: formData.get("nivel"),
    responsavel: formData.get("responsavel"),
    dataIdentificacao: formData.get("dataIdentificacao"),
    protocoloMAPA: formData.get("protocoloMAPA"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: "Confira os campos." };
  }

  // Cria recall + retornos para cada cliente que recebeu algum dos lotes.
  const recall = await prisma.recall.create({
    data: { ...parsed.data, numero: await gerarNumero() },
  });

  // Identifica clientes afetados via MovimentacaoEstoque SAÍDA dos lotes.
  const saidas = await prisma.movimentacaoEstoque.findMany({
    where: { tipo: "SAIDA", loteId: { in: lotesArr }, clienteId: { not: null } },
  });

  // Agrega quantidade notificada por cliente.
  const porCliente = new Map<string, number>();
  for (const s of saidas) {
    if (!s.clienteId) continue;
    porCliente.set(s.clienteId, (porCliente.get(s.clienteId) ?? 0) + s.quantidade);
  }

  for (const [clienteId, qtd] of porCliente.entries()) {
    await prisma.recallRetorno.create({
      data: { recallId: recall.id, clienteId, qtdNotificada: qtd },
    });
  }

  revalidatePath("/recall");
  redirect("/recall");
}
