"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

const STATUS = ["PENDENTE", "ENVIADA", "CONFIRMADA"] as const;

const Schema = z.object({
  ano: z.coerce.number().int().min(2020).max(2100),
  produtoId: z.string().min(1, "Produto obrigatório"),
  qtdProduzida: z.coerce.number().min(0),
  qtdVendida: z.coerce.number().min(0),
  estoque: z.coerce.number().min(0),
  unidade: z.string().min(1, "Unidade obrigatória"),
  status: z.enum(STATUS).default("PENDENTE"),
  observacoes: z
    .union([z.literal(""), z.string()])
    .transform((v) => (!v || !v.trim() ? undefined : v.trim())),
});

export type DeclaracaoFormState = { errors?: Record<string, string[]>; message?: string };

export async function criarDeclaracao(
  _prev: DeclaracaoFormState,
  formData: FormData,
): Promise<DeclaracaoFormState> {
  await requireUser();

  const parsed = Schema.safeParse({
    ano: formData.get("ano"),
    produtoId: formData.get("produtoId"),
    qtdProduzida: formData.get("qtdProduzida"),
    qtdVendida: formData.get("qtdVendida"),
    estoque: formData.get("estoque"),
    unidade: formData.get("unidade"),
    status: formData.get("status") ?? "PENDENTE",
    observacoes: formData.get("observacoes"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: "Confira os campos." };
  }

  try {
    await prisma.declaracaoAnual.create({
      data: {
        ...parsed.data,
        dataEnvio: parsed.data.status !== "PENDENTE" ? new Date() : null,
      },
    });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === "P2002") {
      return { message: "Já existe declaração para esse ano/produto." };
    }
    throw e;
  }

  revalidatePath("/declaracao-anual");
  redirect("/declaracao-anual");
}
