"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const TIPOS_PONTO = ["CAMARA_FRIA", "ARMAZEM", "AREA_PRODUCAO", "CAMARA_RETENCAO"] as const;

const PontoSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório").trim(),
  tipo: z.enum(TIPOS_PONTO),
  tempMin: z.coerce.number(),
  tempMax: z.coerce.number(),
  frequenciaH: z.union([z.literal(""), z.string()]).transform((v) => (v === "" ? undefined : parseInt(String(v), 10))),
  responsavel: z.union([z.literal(""), z.string()]).transform((v) => (!v ? undefined : v.trim())),
});

const RegSchema = z.object({
  pontoId: z.string().min(1),
  temperatura: z.coerce.number(),
  responsavel: z.string().min(2).trim(),
  observacoes: z.union([z.literal(""), z.string()]).transform((v) => (!v || !v.trim() ? undefined : v.trim())),
});

export type TempFormState = { errors?: Record<string, string[]>; message?: string };

export async function criarPonto(_prev: TempFormState, formData: FormData): Promise<TempFormState> {
  await requireUser();
  const parsed = PontoSchema.safeParse({
    nome: formData.get("nome"),
    tipo: formData.get("tipo"),
    tempMin: formData.get("tempMin"),
    tempMax: formData.get("tempMax"),
    frequenciaH: formData.get("frequenciaH") ?? "",
    responsavel: formData.get("responsavel") ?? "",
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, message: "Confira os campos." };
  await prisma.pontoTemperatura.create({ data: parsed.data });
  revalidatePath("/temperatura");
  redirect("/temperatura");
}

export async function registrarLeitura(_prev: TempFormState, formData: FormData): Promise<TempFormState> {
  await requireUser();
  const parsed = RegSchema.safeParse({
    pontoId: formData.get("pontoId"),
    temperatura: formData.get("temperatura"),
    responsavel: formData.get("responsavel"),
    observacoes: formData.get("observacoes"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, message: "Confira os campos." };

  const ponto = await prisma.pontoTemperatura.findUnique({ where: { id: parsed.data.pontoId } });
  if (!ponto) return { message: "Ponto não encontrado." };

  const conforme = parsed.data.temperatura >= ponto.tempMin && parsed.data.temperatura <= ponto.tempMax;

  await prisma.registroTemperatura.create({
    data: { ...parsed.data, conforme },
  });

  revalidatePath("/temperatura");
  return { message: conforme ? "Leitura conforme registrada." : "⚠️ Desvio registrado — abra NC se necessário." };
}
