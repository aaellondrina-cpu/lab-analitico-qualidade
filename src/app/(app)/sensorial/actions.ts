"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const strOpt = z.union([z.literal(""), z.string()]).transform((v) => (!v || !v.trim() ? undefined : v.trim()));
const intOpt = z.union([z.literal(""), z.string()]).transform((v) => (v === "" ? undefined : parseInt(String(v), 10)));

const Schema = z.object({
  loteId: z.string().min(1, "Lote obrigatório"),
  data: z.string().min(1, "Data obrigatória").transform((s) => new Date(s)),
  produtoReferencia: strOpt,
  observacoes: strOpt,
  // Avaliador único registrado direto (simplificação MVP).
  avaliador: z.string().min(2, "Avaliador obrigatório").trim(),
  aparencia: z.coerce.number().int().min(1).max(9),
  cor: z.coerce.number().int().min(1).max(9),
  odor: z.coerce.number().int().min(1).max(9),
  sabor: z.coerce.number().int().min(1).max(9),
  acidez: intOpt,
  carbonatacao: intOpt,
  corpo: intOpt,
  impressaoGlobal: z.coerce.number().int().min(1).max(9),
  parecer: z.enum(["APROVADO", "REPROVADO", "APROVADO_COM_RESSALVA"]),
  comparacaoPadrao: z.union([z.literal(""), z.enum(["IGUAL", "SUPERIOR", "INFERIOR"])]).transform((v) => (v === "" ? undefined : v)),
  desvios: strOpt,
});

export type SensorialFormState = { errors?: Record<string, string[]>; message?: string };

export async function criarSensorial(_prev: SensorialFormState, formData: FormData): Promise<SensorialFormState> {
  await requireUser();

  const parsed = Schema.safeParse({
    loteId: formData.get("loteId"),
    data: formData.get("data"),
    produtoReferencia: formData.get("produtoReferencia"),
    observacoes: formData.get("observacoes"),
    avaliador: formData.get("avaliador"),
    aparencia: formData.get("aparencia"),
    cor: formData.get("cor"),
    odor: formData.get("odor"),
    sabor: formData.get("sabor"),
    acidez: formData.get("acidez") ?? "",
    carbonatacao: formData.get("carbonatacao") ?? "",
    corpo: formData.get("corpo") ?? "",
    impressaoGlobal: formData.get("impressaoGlobal"),
    parecer: formData.get("parecer"),
    comparacaoPadrao: formData.get("comparacaoPadrao") ?? "",
    desvios: formData.get("desvios"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: "Confira os campos." };
  }

  const { loteId, data, produtoReferencia, observacoes, ...itemData } = parsed.data;

  await prisma.avaliacaoSensorial.create({
    data: {
      loteId, data, produtoReferencia, observacoes,
      resultado: itemData.parecer,
      itens: { create: [itemData] },
    },
  });

  revalidatePath("/sensorial");
  redirect("/sensorial");
}
