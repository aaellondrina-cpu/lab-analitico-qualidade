"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { CHECKLIST_ITEMS } from "./checklist";

const strOpt = z.union([z.literal(""), z.string()]).transform((v) => (!v || !v.trim() ? undefined : v.trim()));

const Schema = z.object({
  fornecedor: z.string().min(2).trim(),
  loteFornecedor: z.string().min(1).trim(),
  produtoId: z.string().min(1),
  quantidade: z.coerce.number().int().positive(),
  numeroNF: strOpt,
  status: z.enum(["EM_ANALISE", "APROVADO", "REPROVADO", "APROVADO_COM_RESSALVA"]).default("EM_ANALISE"),
  arteUrl: strOpt,
  observacoes: strOpt,
});

export type RotuloFormState = { errors?: Record<string, string[]>; message?: string };

export async function criarRotulo(_prev: RotuloFormState, formData: FormData): Promise<RotuloFormState> {
  await requireUser();

  const parsed = Schema.safeParse({
    fornecedor: formData.get("fornecedor"),
    loteFornecedor: formData.get("loteFornecedor"),
    produtoId: formData.get("produtoId"),
    quantidade: formData.get("quantidade"),
    numeroNF: formData.get("numeroNF"),
    status: formData.get("status") ?? "EM_ANALISE",
    arteUrl: formData.get("arteUrl"),
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: "Confira os campos." };
  }

  // Construir checklist a partir do formData (formato item-{id}: CONFORME|NAO_CONFORME|NA).
  const checklist: Record<string, string> = {};
  for (const item of CHECKLIST_ITEMS) {
    const val = String(formData.get(`item-${item.id}`) ?? "NA");
    checklist[item.id] = val;
  }

  await prisma.rotulo.create({
    data: { ...parsed.data, checklist: JSON.stringify(checklist) },
  });

  revalidatePath("/embalagens/rotulos");
  redirect("/embalagens/rotulos");
}
