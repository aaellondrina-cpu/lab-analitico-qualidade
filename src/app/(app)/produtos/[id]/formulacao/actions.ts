"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const strOpt = z.union([z.literal(""), z.string()]).transform((v) => (!v || !v.trim() ? undefined : v.trim()));
const numOpt = z.union([z.literal(""), z.string()]).transform((v) => (v === "" ? undefined : Number(v)));

const IngredienteSchema = z.object({
  formulacaoId: z.string().min(1),
  insumoId: strOpt,
  nomeLivre: strOpt,
  quantidade: z.coerce.number().positive(),
  unidade: z.string().min(1),
  percentual: numOpt,
  funcao: z.string().min(1),
  ins: strOpt,
  legislacao: strOpt,
  obrigatorio: z.union([z.literal("on"), z.literal("")]).transform((v) => v === "on"),
});

const FormulacaoSchema = z.object({
  produtoId: z.string().min(1),
  aprovadaPor: z.string().min(2).trim(),
  dataAprovacao: z.string().min(1).transform((s) => new Date(s)),
  observacoes: strOpt,
});

export type FormulacaoState = { errors?: Record<string, string[]>; message?: string };

export async function criarFormulacao(_prev: FormulacaoState, formData: FormData): Promise<FormulacaoState> {
  await requireUser();

  const parsed = FormulacaoSchema.safeParse({
    produtoId: formData.get("produtoId"),
    aprovadaPor: formData.get("aprovadaPor"),
    dataAprovacao: formData.get("dataAprovacao"),
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: "Confira os campos." };
  }

  // Próxima versão e marca anteriores como não vigentes.
  const ult = await prisma.formulacao.findFirst({
    where: { produtoId: parsed.data.produtoId }, orderBy: { versao: "desc" },
  });
  const proxVersao = ult ? ult.versao + 1 : 1;

  await prisma.formulacao.updateMany({
    where: { produtoId: parsed.data.produtoId, vigente: true }, data: { vigente: false },
  });

  await prisma.formulacao.create({
    data: { ...parsed.data, versao: proxVersao, vigente: true },
  });

  revalidatePath(`/produtos/${parsed.data.produtoId}/formulacao`);
  return { message: `Versão ${proxVersao} criada.` };
}

export async function adicionarIngrediente(_prev: FormulacaoState, formData: FormData): Promise<FormulacaoState> {
  await requireUser();

  const parsed = IngredienteSchema.safeParse({
    formulacaoId: formData.get("formulacaoId"),
    insumoId: formData.get("insumoId"),
    nomeLivre: formData.get("nomeLivre"),
    quantidade: formData.get("quantidade"),
    unidade: formData.get("unidade"),
    percentual: formData.get("percentual") ?? "",
    funcao: formData.get("funcao"),
    ins: formData.get("ins"),
    legislacao: formData.get("legislacao"),
    obrigatorio: formData.get("obrigatorio") ?? "",
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: "Confira os campos." };
  }

  await prisma.formulacaoIngrediente.create({ data: parsed.data });

  const fid = parsed.data.formulacaoId;
  const formula = await prisma.formulacao.findUnique({ where: { id: fid } });
  if (formula) revalidatePath(`/produtos/${formula.produtoId}/formulacao`);
  return { message: "Ingrediente adicionado." };
}
