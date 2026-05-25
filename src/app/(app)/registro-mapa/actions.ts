"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const TIPOS = ["ESTABELECIMENTO", "PRODUTO"] as const;

const strOpt = z
  .union([z.literal(""), z.string()])
  .transform((v) => (!v || !v.trim() ? undefined : v.trim()));

const dateOpt = z
  .union([z.literal(""), z.string()])
  .transform((v) => (!v ? undefined : new Date(v)));

const Schema = z.object({
  tipo: z.enum(TIPOS),
  numero: z.string().min(1, "Número obrigatório").trim(),
  dataConcessao: z.string().min(1, "Data de concessão obrigatória").transform((s) => new Date(s)),
  validade: dateOpt,
  numeroProcesso: strOpt,
  sfaEstado: strOpt,
  produtoId: strOpt,
});

export type RegistroMAPAFormState = { errors?: Record<string, string[]>; message?: string };

export async function criarRegistroMAPA(
  _prev: RegistroMAPAFormState,
  formData: FormData,
): Promise<RegistroMAPAFormState> {
  await requireUser();

  const parsed = Schema.safeParse({
    tipo: formData.get("tipo"),
    numero: formData.get("numero"),
    dataConcessao: formData.get("dataConcessao"),
    validade: formData.get("validade"),
    numeroProcesso: formData.get("numeroProcesso"),
    sfaEstado: formData.get("sfaEstado"),
    produtoId: formData.get("produtoId"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: "Confira os campos." };
  }

  await prisma.registroMAPA.create({
    data: {
      tipo: parsed.data.tipo,
      numero: parsed.data.numero,
      dataConcessao: parsed.data.dataConcessao,
      validade: parsed.data.validade,
      numeroProcesso: parsed.data.numeroProcesso,
      sfaEstado: parsed.data.sfaEstado,
      produtoId: parsed.data.tipo === "PRODUTO" ? parsed.data.produtoId : null,
      status: "ATIVO",
    },
  });

  revalidatePath("/registro-mapa");
  redirect("/registro-mapa");
}
