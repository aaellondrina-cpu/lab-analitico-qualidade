"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const TIPOS = ["ENTRADA", "SAIDA"] as const;

const strOpt = z.union([z.literal(""), z.string()]).transform((v) => (!v || !v.trim() ? undefined : v.trim()));
const numOpt = z.union([z.literal(""), z.string()]).transform((v) => (v === "" ? undefined : Number(v)));

const Schema = z.object({
  tipo: z.enum(TIPOS),
  loteId: z.string().min(1, "Lote obrigatório"),
  quantidade: z.coerce.number().positive("Quantidade deve ser positiva"),
  unidade: z.string().min(1, "Unidade obrigatória"),
  clienteId: strOpt,
  notaFiscal: strOpt,
  transportadora: strOpt,
  placaVeiculo: strOpt,
  temperaturaC: numOpt,
  localizacao: strOpt,
  responsavel: z.string().min(2, "Responsável obrigatório").trim(),
});

export type EstoqueFormState = { errors?: Record<string, string[]>; message?: string };

export async function criarMovimentacao(_prev: EstoqueFormState, formData: FormData): Promise<EstoqueFormState> {
  await requireUser();

  const parsed = Schema.safeParse({
    tipo: formData.get("tipo"),
    loteId: formData.get("loteId"),
    quantidade: formData.get("quantidade"),
    unidade: formData.get("unidade") ?? "caixas",
    clienteId: formData.get("clienteId"),
    notaFiscal: formData.get("notaFiscal"),
    transportadora: formData.get("transportadora"),
    placaVeiculo: formData.get("placaVeiculo"),
    temperaturaC: formData.get("temperaturaC") ?? "",
    localizacao: formData.get("localizacao"),
    responsavel: formData.get("responsavel"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: "Confira os campos." };
  }

  if (parsed.data.tipo === "SAIDA" && !parsed.data.clienteId) {
    return { errors: { clienteId: ["Cliente obrigatório em saída"] }, message: "Cliente obrigatório em saída." };
  }

  await prisma.movimentacaoEstoque.create({ data: parsed.data });

  revalidatePath("/estoque");
  redirect("/estoque");
}
