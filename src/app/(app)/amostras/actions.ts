"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { auditLog } from "@/lib/audit";
import { avaliarConformidade, descreverLimite } from "@/lib/conformidade";

const TIPOS_ANALISE = ["ROTINA", "RETENCAO", "REPROCESSO", "AUDITORIA", "RECLAMACAO"] as const;

const AmostraSchema = z.object({
  clienteId: z.string().min(1, "Cliente obrigatório"),
  produtoId: z.string().min(1, "Produto obrigatório"),
  loteId: z.string().min(1, "Lote obrigatório"),
  pontoColetaId: z.string().optional().transform((v) => (v && v !== "" ? v : null)),
  tipoAnalise: z.enum(TIPOS_ANALISE),
  quantidade: z.string().default("1").transform((v) => parseInt(v, 10) || 1),
  volume: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  tempTransporte: z.string().optional().transform((v) => (v && v.trim() !== "" ? Number(v) : null)),
  integridadeOk: z.string().optional().transform((v) => v === "on" || v === "true"),
  responsavelColeta: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  dataColeta: z.string().min(1, "Data coleta obrigatória").transform((s) => new Date(s)),
  prazoEntrega: z.string().min(1, "Prazo obrigatório").transform((s) => new Date(s)),
});

export type AmostraFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
  numeroOS?: string;
};

async function gerarNumero(prefix: string, model: "amostra" | "naoConformidade"): Promise<string> {
  const year = new Date().getFullYear();
  const full = `${prefix}-${year}-`;
  // SQLite-safe sequence: pega o maior numero existente para este prefix-ano
  const last =
    model === "amostra"
      ? await prisma.amostra.findFirst({
          where: { numeroOS: { startsWith: full } },
          orderBy: { numeroOS: "desc" },
        })
      : await prisma.naoConformidade.findFirst({
          where: { numero: { startsWith: full } },
          orderBy: { numero: "desc" },
        });
  const current = last ? (model === "amostra" ? last.numeroOS : last.numero) : null;
  const nextSeq = current ? parseInt(current.slice(full.length), 10) + 1 : 1;
  return `${full}${String(nextSeq).padStart(4, "0")}`;
}

export async function criarAmostra(
  _prev: AmostraFormState,
  formData: FormData,
): Promise<AmostraFormState> {
  await requireUser();

  const parsed = AmostraSchema.safeParse({
    clienteId: formData.get("clienteId"),
    produtoId: formData.get("produtoId"),
    loteId: formData.get("loteId"),
    pontoColetaId: formData.get("pontoColetaId"),
    tipoAnalise: formData.get("tipoAnalise"),
    quantidade: formData.get("quantidade"),
    volume: formData.get("volume"),
    tempTransporte: formData.get("tempTransporte"),
    integridadeOk: formData.get("integridadeOk"),
    responsavelColeta: formData.get("responsavelColeta"),
    dataColeta: formData.get("dataColeta"),
    prazoEntrega: formData.get("prazoEntrega"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  const numeroOS = await gerarNumero("OS", "amostra");

  let created;
  try {
    created = await prisma.amostra.create({
      data: { ...parsed.data, numeroOS },
    });
  } catch (e) {
    return { message: `Erro ao criar amostra: ${(e as Error).message}` };
  }

  await auditLog({
    action: "CREATE",
    entity: "Amostra",
    entityId: created.id,
    diff: { numeroOS, ...parsed.data },
  });

  revalidatePath("/amostras");
  revalidatePath("/dashboard");
  return { ok: true, numeroOS };
}

const ResultadoSchema = z.object({
  parametro: z.string().min(1, "Parâmetro obrigatório").trim(),
  valor: z.string().min(1, "Valor obrigatório").transform((s) => Number(s.replace(",", "."))),
  unidade: z.string().min(1, "Unidade obrigatória").trim(),
  metodo: z.string().optional().transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  analista: z.string().min(1, "Analista obrigatório").trim(),
  equipamentoId: z.string().optional().transform((v) => (v && v !== "" ? v : null)),
});

export type ResultadoFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  ok?: boolean;
  warning?: string;
};

export async function lancarResultado(
  amostraId: string,
  _prev: ResultadoFormState,
  formData: FormData,
): Promise<ResultadoFormState> {
  const user = await requireUser();

  const parsed = ResultadoSchema.safeParse({
    parametro: formData.get("parametro"),
    valor: formData.get("valor"),
    unidade: formData.get("unidade"),
    metodo: formData.get("metodo"),
    analista: formData.get("analista"),
    equipamentoId: formData.get("equipamentoId"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]> };
  }

  if (Number.isNaN(parsed.data.valor)) {
    return { errors: { valor: ["Valor numérico inválido"] } };
  }

  const amostra = await prisma.amostra.findUnique({
    where: { id: amostraId },
    include: { produto: { include: { especificacoes: true } } },
  });
  if (!amostra) return { message: "Amostra não encontrada." };

  // Busca a especificação correspondente (case-insensitive)
  const espec = amostra.produto.especificacoes.find(
    (e) => e.parametro.toLowerCase() === parsed.data.parametro.toLowerCase(),
  );

  let conformidade: "CONFORME" | "NAO_CONFORME" | "ATENCAO" = "CONFORME";
  let warning: string | undefined;

  if (espec) {
    if (espec.unidade.toLowerCase() !== parsed.data.unidade.toLowerCase()) {
      warning = `Unidade divergente: spec é "${espec.unidade}" e você lançou "${parsed.data.unidade}". Confira antes de aprovar.`;
    }
    conformidade = avaliarConformidade(parsed.data.valor, espec.minimo, espec.maximo);
  } else {
    warning = `Parâmetro "${parsed.data.parametro}" não tem especificação no produto. Conformidade não pôde ser avaliada.`;
  }

  // Cria resultado, avança status, e abre NC se necessário — tudo em transação
  const result = await prisma.$transaction(async (tx) => {
    const resultado = await tx.resultado.create({
      data: {
        amostraId,
        parametro: parsed.data.parametro,
        valor: parsed.data.valor,
        unidade: parsed.data.unidade,
        metodo: parsed.data.metodo,
        conformidade,
        analista: parsed.data.analista,
        equipamentoId: parsed.data.equipamentoId,
      },
    });

    // Status RECEBIDA → EM_ANALISE quando 1º resultado é lançado
    if (amostra.status === "RECEBIDA") {
      await tx.amostra.update({ where: { id: amostraId }, data: { status: "EM_ANALISE" } });
    }

    let ncCreated: { id: string; numero: string } | null = null;

    if (conformidade === "NAO_CONFORME" && espec) {
      const numero = await gerarNumero("NC", "naoConformidade");
      const nc = await tx.naoConformidade.create({
        data: {
          numero,
          amostraId,
          parametro: parsed.data.parametro,
          valorObtido: parsed.data.valor,
          limite: descreverLimite(espec.minimo, espec.maximo, espec.unidade),
          descricao: `Resultado fora da especificação: ${parsed.data.valor} ${parsed.data.unidade} (limite: ${descreverLimite(espec.minimo, espec.maximo, espec.unidade)})`,
          acao: "REVISAR",
          responsavel: user.name ?? user.email ?? "—",
          prazo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: "ABERTA",
        },
      });
      ncCreated = nc;
    }

    return { resultado, ncCreated };
  });

  await auditLog({
    action: "CREATE",
    entity: "Resultado",
    entityId: result.resultado.id,
    diff: {
      amostraId,
      parametro: parsed.data.parametro,
      valor: parsed.data.valor,
      unidade: parsed.data.unidade,
      conformidade,
    },
  });

  if (result.ncCreated) {
    await auditLog({
      action: "CREATE",
      entity: "NaoConformidade",
      entityId: result.ncCreated.id,
      diff: { numero: result.ncCreated.numero, motivo: "auto-criada por resultado NAO_CONFORME" },
    });
  }

  revalidatePath(`/amostras/${amostraId}`);
  revalidatePath("/amostras");
  revalidatePath("/nao-conformidades");
  revalidatePath("/dashboard");

  return { ok: true, warning };
}

export async function aprovarAmostra(id: string) {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "RESPONSAVEL_TECNICO") {
    return { message: "Apenas Responsável Técnico ou Admin podem aprovar amostras." };
  }

  const amostra = await prisma.amostra.findUnique({
    where: { id },
    include: { resultados: true, ncs: { where: { status: { not: "ENCERRADA" } } } },
  });
  if (!amostra) return { message: "Amostra não encontrada." };
  if (amostra.resultados.length === 0) return { message: "Sem resultados — não há o que aprovar." };
  if (amostra.ncs.length > 0) return { message: "Existe NC aberta — encerre antes de aprovar." };

  await prisma.amostra.update({ where: { id }, data: { status: "APROVADO" } });
  await auditLog({ action: "APPROVE", entity: "Amostra", entityId: id, diff: { numeroOS: amostra.numeroOS } });
  revalidatePath(`/amostras/${id}`);
  revalidatePath("/amostras");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function excluirResultado(id: string, amostraId: string) {
  await requireUser();
  const removed = await prisma.resultado.delete({ where: { id } });
  await auditLog({ action: "DELETE", entity: "Resultado", entityId: id, diff: removed });
  revalidatePath(`/amostras/${amostraId}`);
  return { ok: true };
}

export async function excluirAmostra(id: string) {
  await requireUser();
  let removed;
  try {
    removed = await prisma.amostra.delete({ where: { id } });
  } catch {
    return { message: "Não foi possível excluir." };
  }
  await auditLog({ action: "DELETE", entity: "Amostra", entityId: id, diff: { numeroOS: removed.numeroOS } });
  revalidatePath("/amostras");
  revalidatePath("/dashboard");
  redirect("/amostras");
}
