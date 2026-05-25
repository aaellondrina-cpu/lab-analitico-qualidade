import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TOKEN = "limsqual-demo-seed-2026";
const PRODUTO_CODIGO = "REF-0002";

const CLIENTES = [
  { razaoSocial: "Distribuidora Boa Vida Ltda", cnpj: "12.345.678/0001-90", responsavel: "Maria Souza", email: "maria@boavida.com.br", telefone: "(81) 3333-4444" },
  { razaoSocial: "Supermercado União S.A.", cnpj: "98.765.432/0001-10", responsavel: "Carlos Pereira", email: "qualidade@uniao.com.br", telefone: "(41) 3232-1010" },
  { razaoSocial: "Bar e Restaurante Zé Mané ME", cnpj: "55.444.333/0001-22", responsavel: "José Manuel", email: "zemane@bardozemane.com", telefone: "(11) 99876-5432" },
  { razaoSocial: "Bebidas Aurora Ltda", cnpj: "33.222.111/0001-66", responsavel: "Ana Lima", email: "qualidade@aurora.com.br", telefone: "(51) 3024-7700" },
  { razaoSocial: "Refrigerantes Verão SA", cnpj: "44.555.666/0001-77", responsavel: "Roberto Mendes", email: "rmendes@verao.com.br", telefone: "(31) 3434-9090" },
];

const RESULTADOS = [
  { parametro: "Brix", valor: 11.0, unidade: "°Brix", conformidade: "CONFORME" },
  { parametro: "Densidade", valor: 1.05, unidade: "g/mL", conformidade: "CONFORME" },
  { parametro: "CO2", valor: 3.5, unidade: "vol", conformidade: "CONFORME" },
  { parametro: "Acidez", valor: 0.12, unidade: "g/100mL", conformidade: "CONFORME" },
  { parametro: "Coliformes totais", valor: 20, unidade: "NMP/mL", conformidade: "CONFORME" },
];

const RESULTADOS_REPROVADO = RESULTADOS.map((r) =>
  r.parametro === "CO2" ? { ...r, valor: 5.5, conformidade: "NAO_CONFORME" } : r,
);

function diasFrente(n: number) { const d = new Date(); d.setDate(d.getDate() + n); return d; }
function diasAtras(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d; }

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (token !== TOKEN) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const log: string[] = [];

  // 1. Configuração do laboratório (com campos MAPA)
  const cfg = await prisma.configuracaoLaboratorio.findFirst();
  if (!cfg) {
    await prisma.configuracaoLaboratorio.create({
      data: {
        razaoSocial: "LimsQual Controle de Qualidade Ltda",
        nomeFantasia: "LimsQual", cnpj: "11.222.333/0001-44",
        endereco: "Rua das Indústrias, 1500", cep: "50000-000",
        cidade: "Recife", estado: "PE",
        telefone: "(81) 3000-1000", email: "contato@limsqual.app",
        site: "limsqual.app",
        rtNome: "Dr. Patricio Ferreira", rtFormacao: "QUIMICO", rtRegistro: "CRQ-IV-12345",
        mapaNumero: "MAPA-PE-001/2024", mapaValidade: diasFrente(365),
        mapaDataConcessao: diasAtras(365),
        mapaNumeroProcesso: "21000.012345/2024-01",
        mapaSFA: "PE",
      },
    });
    log.push("Configuração do laboratório criada");
  }

  // 2. Produto com Registro MAPA
  let produto = await prisma.produto.findUnique({ where: { codigo: PRODUTO_CODIGO } });
  if (!produto) {
    produto = await prisma.produto.create({
      data: {
        nome: "Refrigerante Cola PET 2L", codigo: PRODUTO_CODIGO,
        tipo: "NAO_ALCOOLICA", sabor: "Cola", volume: 2000,
        tipoEmbalagem: "PET", versao: "REGULAR", validadeDias: 180,
        mapaProdutoNumero: "REG-MAPA-PROD-2026/0042",
        mapaProdutoData: diasAtras(180),
        mapaProdutoValidade: diasFrente(548),
        rotulagemStatus: "APROVADA",
      },
    });
    log.push(`Produto ${PRODUTO_CODIGO} criado`);
  }

  // 3. Admin emissor
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) return NextResponse.json({ error: "admin nao existe — rode /api/bootstrap-admin primeiro" }, { status: 400 });

  // 4. Registros MAPA — estabelecimento e produto
  const regEst = await prisma.registroMAPA.findFirst({ where: { tipo: "ESTABELECIMENTO" } });
  if (!regEst) {
    await prisma.registroMAPA.create({
      data: {
        tipo: "ESTABELECIMENTO",
        numero: "MAPA-EST-PE-12345/2024",
        dataConcessao: diasAtras(365),
        validade: diasFrente(730),
        numeroProcesso: "21000.012345/2024-01",
        sfaEstado: "PE",
      },
    });
    log.push("Registro MAPA do estabelecimento criado");
  }
  const regProd = await prisma.registroMAPA.findFirst({ where: { tipo: "PRODUTO", produtoId: produto.id } });
  if (!regProd) {
    await prisma.registroMAPA.create({
      data: {
        tipo: "PRODUTO",
        numero: "REG-MAPA-PROD-2026/0042",
        dataConcessao: diasAtras(180),
        validade: diasFrente(548),
        numeroProcesso: "21000.054321/2026-01",
        sfaEstado: "PE",
        produtoId: produto.id,
      },
    });
    log.push("Registro MAPA do produto criado");
  }

  // 5. Declaração anual (ano anterior, ENVIADA)
  const anoAnterior = new Date().getFullYear() - 1;
  const declExist = await prisma.declaracaoAnual.findUnique({
    where: { ano_produtoId: { ano: anoAnterior, produtoId: produto.id } },
  });
  if (!declExist) {
    await prisma.declaracaoAnual.create({
      data: {
        ano: anoAnterior, produtoId: produto.id,
        qtdProduzida: 1_250_000, qtdVendida: 1_180_000, estoque: 70_000,
        unidade: "L", status: "ENVIADA", dataEnvio: new Date(`${anoAnterior + 1}-01-28`),
        observacoes: "Declaração consolidada dos 12 meses.",
      },
    });
    log.push(`Declaração anual ${anoAnterior} criada`);
  }

  // 6. Loop clientes — também cria registros BPF, contraprovas, custos
  for (let i = 0; i < CLIENTES.length; i++) {
    const c = CLIENTES[i];
    const reprovado = i === 2;

    let cliente = await prisma.cliente.findUnique({ where: { cnpj: c.cnpj } });
    if (!cliente) {
      cliente = await prisma.cliente.create({ data: c });
      log.push(`Cliente: ${c.razaoSocial}`);
    }

    const numeroLote = `L-DEMO-${1000 + i}`;
    let lote = await prisma.lote.findUnique({ where: { numero: numeroLote } });
    if (!lote) {
      const custoInsumos = 4500 + i * 120;
      const custoEmbalagens = 800 + i * 30;
      const custoTotal = custoInsumos + custoEmbalagens;
      lote = await prisma.lote.create({
        data: {
          numero: numeroLote, produtoId: produto.id, sabor: produto.sabor,
          dataInicioProducao: diasAtras(7), dataFimProducao: diasAtras(6),
          volumeTotal: "5000L", unidadesProduzidas: 8333,
          linha: `Linha ${i + 1}`, turno: ["MANHA", "TARDE", "NOITE"][i % 3],
          responsavelProducao: "Equipe de Produção",
          status: reprovado ? "REPROVADO" : "APROVADO",
          custoInsumos, custoEmbalagens, custoTotal,
          custoPorUnidade: custoTotal / 8333,
          custoPorLitro: custoTotal / 5000,
        },
      });
    }

    // BPF — 3 etapas por lote (xarope, carbonatação, envase)
    const jaTemBPF = await prisma.registroBPF.count({ where: { loteId: lote.id } });
    if (jaTemBPF === 0) {
      await prisma.registroBPF.createMany({
        data: [
          {
            loteId: lote.id, etapa: "XAROPE_COMPOSTO",
            data: diasAtras(7), responsavel: "Equipe de Produção",
            parametros: JSON.stringify({ litros: 2000, brixComposto: 60, tempC: 22 }),
          },
          {
            loteId: lote.id, etapa: "CARBONATACAO",
            data: diasAtras(7), responsavel: "Operador Carbonatação",
            parametros: JSON.stringify({ volCO2: reprovado ? 5.5 : 3.5, pressaoBar: 4.2, tempC: 4 }),
            observacoes: reprovado ? "CO2 acima — investigar fluxo." : undefined,
          },
          {
            loteId: lote.id, etapa: "ENVASE",
            data: diasAtras(6), responsavel: `Operador Linha ${i + 1}`,
            parametros: JSON.stringify({ linha: `Linha ${i + 1}`, velocidadeUph: 12000 }),
          },
        ],
      });
    }

    const numeroOS = `OS-DEMO-${2026000 + i}`;
    let amostra = await prisma.amostra.findUnique({ where: { numeroOS } });
    if (!amostra) {
      amostra = await prisma.amostra.create({
        data: {
          numeroOS, clienteId: cliente.id, produtoId: produto.id, loteId: lote.id,
          tipoAnalise: "ROTINA", status: "LAUDO_EMITIDO",
          quantidade: 3, volume: "1,5L", tempTransporte: 4.0, integridadeOk: true,
          responsavelColeta: "Coletador LimsQual",
          dataColeta: diasAtras(5), dataRecebimento: diasAtras(4), prazoEntrega: diasAtras(1),
        },
      });
    }

    // Contraprova — IN MAPA 55/2009
    const cpExist = await prisma.contraProva.findUnique({ where: { amostraId: amostra.id } });
    if (!cpExist) {
      await prisma.contraProva.create({
        data: {
          amostraId: amostra.id,
          codigo: `CP-${numeroOS}`,
          quantidade: 0.5, embalagem: "Garrafa PET lacrada",
          localArmazenamento: "Câmara de retenção — Sala 03",
          dataColeta: diasAtras(5),
          prazoDescarte: diasFrente(180),
          status: "RETIDA",
        },
      });
    }

    const jaTemRes = await prisma.resultado.count({ where: { amostraId: amostra.id } });
    if (jaTemRes === 0) {
      const fonte = reprovado ? RESULTADOS_REPROVADO : RESULTADOS;
      for (const r of fonte) {
        const resultado = await prisma.resultado.create({
          data: {
            amostraId: amostra.id, parametro: r.parametro, valor: r.valor,
            unidade: r.unidade, metodo: "AOAC 2024", conformidade: r.conformidade,
            analista: "Patricio Ferreira", dataEnsaio: diasAtras(3),
          },
        });
        if (r.conformidade === "NAO_CONFORME") {
          await prisma.naoConformidade.create({
            data: {
              numero: `NC-DEMO-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
              amostraId: amostra.id, resultadoId: resultado.id,
              parametro: r.parametro, valorObtido: r.valor, limite: "3,0–4,0",
              descricao: `Valor obtido (${r.valor}) fora do limite especificado.`,
              acao: "RETER", responsavel: "RT", prazo: diasFrente(7), status: "ABERTA",
            },
          });
        }
      }
    }

    const jaTemLaudo = await prisma.laudo.findUnique({ where: { amostraId: amostra.id } });
    if (!jaTemLaudo) {
      await prisma.laudo.create({
        data: {
          numero: `L-2026-${String(1000 + i).padStart(4, "0")}`,
          amostraId: amostra.id,
          conclusao: reprovado ? "REPROVADO" : "APROVADO",
          observacoes: reprovado
            ? "Amostra reprovada por CO2 acima do limite especificado."
            : "Todos os parâmetros dentro da especificação.",
          emitidoPorId: admin.id, emitidoPorNome: admin.name, emitidoPorRole: admin.role,
          qrToken: crypto.randomBytes(16).toString("hex"),
        },
      });
    }
  }

  const counts = {
    clientes: await prisma.cliente.count(),
    lotes: await prisma.lote.count(),
    amostras: await prisma.amostra.count(),
    resultados: await prisma.resultado.count(),
    laudos: await prisma.laudo.count(),
    registrosMAPA: await prisma.registroMAPA.count(),
    declaracoes: await prisma.declaracaoAnual.count(),
    registrosBPF: await prisma.registroBPF.count(),
    contraProvas: await prisma.contraProva.count(),
  };

  return NextResponse.json({ ok: true, counts, log });
}
