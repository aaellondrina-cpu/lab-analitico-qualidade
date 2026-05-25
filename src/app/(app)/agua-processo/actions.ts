"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const TIPOS = ["DIARIO", "MENSAL", "SEMESTRAL"] as const;
const STATUS = ["CONFORME", "ATENCAO", "NAO_CONFORME"] as const;

const strOpt = z.union([z.literal(""), z.string()]).transform((v) => (!v || !v.trim() ? undefined : v.trim()));

const Schema = z.object({
  ponto: z.string().min(2, "Ponto obrigatório").trim(),
  tipo: z.enum(TIPOS),
  data: z.string().min(1, "Data obrigatória").transform((s) => new Date(s)),
  responsavel: z.string().min(2, "Responsável obrigatório").trim(),
  status: z.enum(STATUS).default("CONFORME"),
  parametros: strOpt,
  laudoUrl: strOpt,
  numeroLaudo: strOpt,
  observacoes: strOpt,
});

export type AguaFormState = { errors?: Record<string, string[]>; message?: string };

export async function criarControleAgua(_prev: AguaFormState, formData: FormData): Promise<AguaFormState> {
  await requireUser();

  const parsed = Schema.safeParse({
    ponto: formData.get("ponto"),
    tipo: formData.get("tipo"),
    data: formData.get("data"),
    responsavel: formData.get("responsavel"),
    status: formData.get("status") ?? "CONFORME",
    parametros: formData.get("parametros"),
    laudoUrl: formData.get("laudoUrl"),
    numeroLaudo: formData.get("numeroLaudo"),
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: "Confira os campos." };
  }

  if (parsed.data.parametros) {
    try { JSON.parse(parsed.data.parametros); }
    catch { return { errors: { parametros: ["JSON inválido"] }, message: "Parâmetros precisam ser JSON válido." }; }
  }

  await prisma.controleAgua.create({ data: parsed.data });

  revalidatePath("/agua-processo");
  redirect("/agua-processo");
}
