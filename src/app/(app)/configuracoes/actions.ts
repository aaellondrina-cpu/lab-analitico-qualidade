"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { auditLog } from "@/lib/audit";

const dateOpt = z
  .union([z.literal(""), z.string()])
  .transform((v) => (!v ? undefined : new Date(v)));

const strOpt = z
  .union([z.literal(""), z.string()])
  .transform((v) => (!v || !v.trim() ? undefined : v.trim()));

const ConfigSchema = z.object({
  razaoSocial: z.string().min(2, "Razão social obrigatória").trim(),
  nomeFantasia: strOpt,
  cnpj: z.string().min(14, "CNPJ obrigatório").trim(),
  inscricaoEstadual: strOpt,
  endereco: z.string().min(3, "Endereço obrigatório").trim(),
  cep: z.string().min(8, "CEP obrigatório").trim(),
  cidade: z.string().min(2, "Cidade obrigatória").trim(),
  estado: z.string().min(2, "UF obrigatória").trim(),
  telefone: z.string().min(8, "Telefone obrigatório").trim(),
  email: z.email("E-mail inválido").trim(),
  site: strOpt,
  logoUrl: strOpt,

  rtNome: z.string().min(3, "Nome do RT obrigatório").trim(),
  rtFormacao: z.enum(["FARMACEUTICO", "QUIMICO", "BIOLOGO", "ENG_ALIMENTOS", "OUTRO"]),
  rtRegistro: z.string().min(3, "Registro do RT obrigatório").trim(),
  rtAssinaturaUrl: strOpt,

  mapaNumero: strOpt,
  mapaValidade: dateOpt,
  anvisaNumero: strOpt,
  anvisaValidade: dateOpt,
  inmetroNumero: strOpt,
  inmetroValidade: dateOpt,
  inmetroEscopo: strOpt,
  vigilanciaNumero: strOpt,
  vigilanciaOrgao: strOpt,
  vigilanciaValidade: dateOpt,
  ibamaNumero: strOpt,
  outrosRegistros: strOpt,
});

export type ConfiguracaoFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
};

export async function salvarConfiguracao(
  _prev: ConfiguracaoFormState,
  formData: FormData,
): Promise<ConfiguracaoFormState> {
  await requireRole("ADMIN");

  const obj: Record<string, FormDataEntryValue | null> = {};
  for (const k of Object.keys(ConfigSchema.shape)) {
    obj[k] = formData.get(k);
  }

  const parsed = ConfigSchema.safeParse(obj);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  const existing = await prisma.configuracaoLaboratorio.findFirst();

  const saved = existing
    ? await prisma.configuracaoLaboratorio.update({
        where: { id: existing.id },
        data: parsed.data,
      })
    : await prisma.configuracaoLaboratorio.create({ data: parsed.data });

  await auditLog({
    action: existing ? "UPDATE" : "CREATE",
    entity: "ConfiguracaoLaboratorio",
    entityId: saved.id,
    diff: parsed.data,
  });

  revalidatePath("/configuracoes");
  revalidatePath("/laudos", "layout");
  return { ok: true };
}
