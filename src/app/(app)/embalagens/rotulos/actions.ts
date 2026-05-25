"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

// 24 itens do checklist RDC 259/2002 + Decreto 6.871/2009.
export const CHECKLIST_ITEMS = [
  { id: "denominacao", label: "Denominação de venda (conforme registro MAPA)", grupo: "Identificação" },
  { id: "registroMAPA", label: "Número de registro MAPA do produto", grupo: "Identificação" },
  { id: "marca", label: "Marca comercial", grupo: "Identificação" },
  { id: "ingredientes", label: "Lista de ingredientes em ordem decrescente", grupo: "Composição" },
  { id: "aditivos", label: "Aditivos com nome e INS", grupo: "Composição" },
  { id: "alergenos", label: "Declaração de alérgenos", grupo: "Composição" },
  { id: "edulcorantes", label: "Declaração de edulcorantes (se diet)", grupo: "Composição" },
  { id: "fabricante", label: "Razão social e CNPJ do fabricante", grupo: "Fabricante" },
  { id: "endereco", label: "Endereço completo do estabelecimento", grupo: "Fabricante" },
  { id: "registroEstab", label: "Registro do estabelecimento no MAPA", grupo: "Fabricante" },
  { id: "origem", label: '"Indústria Brasileira" ou indicação de origem', grupo: "Fabricante" },
  { id: "volume", label: "Volume líquido (ex: 2L, 350mL)", grupo: "Conteúdo" },
  { id: "lote", label: "Campo para impressão do lote", grupo: "Conteúdo" },
  { id: "dataFab", label: "Campo para data de fabricação", grupo: "Conteúdo" },
  { id: "validade", label: "Prazo de validade", grupo: "Conteúdo" },
  { id: "tabelaNutri", label: "Tabela nutricional RDC 429/2020", grupo: "Nutrição" },
  { id: "valorEnergetico", label: "Valor energético (kcal e kJ)", grupo: "Nutrição" },
  { id: "macronutrientes", label: "Carboidratos, proteínas, gorduras, fibras, sódio", grupo: "Nutrição" },
  { id: "lupaFrontal", label: "Lupa frontal (se exceder limites)", grupo: "Nutrição" },
  { id: "alertaAlcool", label: '"Beba com moderação" (se alcoólica)', grupo: "Alertas" },
  { id: "alerta18", label: '"Venda proibida menores 18" (se alcoólica)', grupo: "Alertas" },
  { id: "alertaDiet", label: 'Advertência diet/zero', grupo: "Alertas" },
  { id: "codigoBarras", label: "Código de barras legível (EAN-13/EAN-8)", grupo: "Código" },
  { id: "legibilidade", label: "Legibilidade e impressão conforme arte", grupo: "Inspeção" },
];

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
