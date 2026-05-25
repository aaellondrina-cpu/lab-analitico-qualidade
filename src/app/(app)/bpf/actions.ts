"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const ETAPAS = [
  "XAROPE_SIMPLES",
  "XAROPE_COMPOSTO",
  "CARBONATACAO",
  "ENVASE",
  "HIGIENE",
  "LIMPEZA",
  "TEMPERATURA",
  "PRAGAS",
] as const;

const Schema = z.object({
  loteId: z
    .union([z.literal(""), z.string()])
    .transform((v) => (!v ? undefined : v)),
  etapa: z.enum(ETAPAS),
  data: z.string().min(1, "Data obrigatória").transform((s) => new Date(s)),
  responsavel: z.string().min(2, "Responsável obrigatório").trim(),
  parametros: z
    .union([z.literal(""), z.string()])
    .transform((v) => (!v || !v.trim() ? undefined : v.trim())),
  observacoes: z
    .union([z.literal(""), z.string()])
    .transform((v) => (!v || !v.trim() ? undefined : v.trim())),
});

export type BPFFormState = { errors?: Record<string, string[]>; message?: string };

export async function criarRegistroBPF(
  _prev: BPFFormState,
  formData: FormData,
): Promise<BPFFormState> {
  await requireUser();

  const parsed = Schema.safeParse({
    loteId: formData.get("loteId"),
    etapa: formData.get("etapa"),
    data: formData.get("data"),
    responsavel: formData.get("responsavel"),
    parametros: formData.get("parametros"),
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: "Confira os campos." };
  }

  // valida JSON dos parâmetros
  if (parsed.data.parametros) {
    try {
      JSON.parse(parsed.data.parametros);
    } catch {
      return { errors: { parametros: ["JSON inválido"] }, message: "Parâmetros precisam ser JSON válido." };
    }
  }

  await prisma.registroBPF.create({ data: parsed.data });

  revalidatePath("/bpf");
  redirect("/bpf");
}
