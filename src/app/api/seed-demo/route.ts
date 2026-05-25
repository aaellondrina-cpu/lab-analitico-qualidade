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

  // === ZIP 5 — Dados de demonstração dos novos models ===

  // Formulação vigente do produto.
  const formExist = await prisma.formulacao.findFirst({ where: { produtoId: produto.id, vigente: true } });
  if (!formExist) {
    const f = await prisma.formulacao.create({
      data: {
        produtoId: produto.id, versao: 1, vigente: true,
        aprovadaPor: admin.name, dataAprovacao: diasAtras(60),
        observacoes: "Receita base do refrigerante cola PET 2L.",
      },
    });
    await prisma.formulacaoIngrediente.createMany({
      data: [
        { formulacaoId: f.id, nomeLivre: "Água tratada", quantidade: 880, unidade: "L", percentual: 88.0, funcao: "materia_prima", obrigatorio: true },
        { formulacaoId: f.id, nomeLivre: "Açúcar cristal", quantidade: 110, unidade: "kg", percentual: 11.0, funcao: "edulcorante", obrigatorio: true },
        { formulacaoId: f.id, nomeLivre: "Concentrado Cola", quantidade: 5, unidade: "L", percentual: 0.5, funcao: "aromatizante", ins: "—", obrigatorio: true },
        { formulacaoId: f.id, nomeLivre: "Ácido fosfórico", quantidade: 0.4, unidade: "kg", percentual: 0.04, funcao: "acidulante", ins: "INS 338", legislacao: "RDC ANVISA 8/2013", obrigatorio: true },
        { formulacaoId: f.id, nomeLivre: "Benzoato de sódio", quantidade: 0.15, unidade: "kg", percentual: 0.015, funcao: "conservante", ins: "INS 211", legislacao: "RDC ANVISA 8/2013", obrigatorio: true },
      ],
    });
    log.push("Formulação v1 criada com 5 ingredientes");
  }

  // Avaliações sensoriais — 1 por lote (3 primeiros).
  const todosLotes = await prisma.lote.findMany({ take: 5, orderBy: { createdAt: "desc" } });
  for (let i = 0; i < Math.min(3, todosLotes.length); i++) {
    const lt = todosLotes[i];
    const exist = await prisma.avaliacaoSensorial.findFirst({ where: { loteId: lt.id } });
    if (!exist) {
      const reprovado = i === 2;
      await prisma.avaliacaoSensorial.create({
        data: {
          loteId: lt.id, data: diasAtras(4),
          resultado: reprovado ? "REPROVADO" : "APROVADO",
          produtoReferencia: "Padrão Cola Original",
          itens: {
            create: [
              {
                avaliador: "Painelista A",
                aparencia: 8, cor: 8, odor: 7, sabor: reprovado ? 4 : 8,
                carbonatacao: reprovado ? 3 : 7, corpo: 7, impressaoGlobal: reprovado ? 4 : 8,
                parecer: reprovado ? "REPROVADO" : "APROVADO",
                comparacaoPadrao: reprovado ? "INFERIOR" : "IGUAL",
                desvios: reprovado ? "Carbonatação alta, off-flavor metálico" : undefined,
              },
              {
                avaliador: "Painelista B",
                aparencia: 7, cor: 8, odor: 7, sabor: reprovado ? 5 : 8,
                carbonatacao: reprovado ? 3 : 8, corpo: 8, impressaoGlobal: reprovado ? 5 : 8,
                parecer: reprovado ? "REPROVADO" : "APROVADO",
                comparacaoPadrao: reprovado ? "INFERIOR" : "IGUAL",
              },
            ],
          },
        },
      });
    }
  }

  // Controle de Água — 5 registros (3 diários, 2 mensais).
  const aguaCount = await prisma.controleAgua.count();
  if (aguaCount === 0) {
    for (let i = 0; i < 3; i++) {
      await prisma.controleAgua.create({
        data: {
          ponto: "Reservatório R1 — entrada da indústria",
          tipo: "DIARIO", data: diasAtras(i),
          parametros: JSON.stringify({ cloroResidualMgL: 1.1 + i * 0.05, pH: 7.0 + i * 0.05, turbidezUT: 0.4, tempC: 22 }),
          responsavel: "Operador Turno A", status: "CONFORME",
        },
      });
    }
    await prisma.controleAgua.create({
      data: {
        ponto: "Reservatório R1 — entrada da indústria",
        tipo: "MENSAL", data: diasAtras(15),
        parametros: JSON.stringify({ coliformesTotais: "ausencia/100mL", eColi: "ausencia/100mL", corUH: 4, condutividade: 220, ferroMgL: 0.04 }),
        responsavel: "Analista LimsQual", status: "CONFORME",
      },
    });
    await prisma.controleAgua.create({
      data: {
        ponto: "Reservatório R1 — entrada da indústria",
        tipo: "SEMESTRAL", data: diasAtras(90),
        parametros: JSON.stringify({ laudo: "Laboratorio Externo XYZ", parametros: 40, conformidade: "TOTAL" }),
        responsavel: "Analista LimsQual", status: "CONFORME",
        numeroLaudo: "LAB-XYZ-2026-0123",
      },
    });
    log.push("5 registros de controle de água criados");
  }

  // Pontos de Temperatura + leituras.
  const pontoExist = await prisma.pontoTemperatura.findFirst();
  if (!pontoExist) {
    const p1 = await prisma.pontoTemperatura.create({
      data: { nome: "Câmara Fria 1", tipo: "CAMARA_FRIA", tempMin: 2, tempMax: 8, frequenciaH: 4, responsavel: "Operador Câmara" },
    });
    const p2 = await prisma.pontoTemperatura.create({
      data: { nome: "Câmara de Retenção", tipo: "CAMARA_RETENCAO", tempMin: 18, tempMax: 25, frequenciaH: 12, responsavel: "RT" },
    });
    for (const pt of [p1, p2]) {
      for (let h = 0; h < 6; h++) {
        const temp = pt.tipo === "CAMARA_FRIA" ? 4 + Math.random() * 2 : 22 + Math.random() * 1.5;
        const desvio = h === 2 && pt.tipo === "CAMARA_FRIA";
        await prisma.registroTemperatura.create({
          data: {
            pontoId: pt.id,
            temperatura: desvio ? 11.2 : temp,
            conforme: desvio ? false : true,
            responsavel: pt.responsavel ?? "Operador",
            observacoes: desvio ? "Porta aberta durante limpeza" : undefined,
            data: new Date(Date.now() - h * 4 * 3600 * 1000),
          },
        });
      }
    }
    log.push("2 pontos de temperatura + 12 leituras criados");
  }

  // Movimentações de estoque — 1 entrada + 1 saída por cliente.
  const movCount = await prisma.movimentacaoEstoque.count();
  if (movCount === 0 && todosLotes.length > 0) {
    const clientesDB = await prisma.cliente.findMany({ take: 5 });
    for (let i = 0; i < todosLotes.length; i++) {
      const lt = todosLotes[i];
      await prisma.movimentacaoEstoque.create({
        data: {
          tipo: "ENTRADA", loteId: lt.id, quantidade: 350, unidade: "caixas",
          localizacao: `Prateleira ${String.fromCharCode(65 + i)}-${10 + i}`,
          responsavel: "Operador Almoxarifado", data: diasAtras(5 - i),
        },
      });
      const cli = clientesDB[i % clientesDB.length];
      if (cli) {
        await prisma.movimentacaoEstoque.create({
          data: {
            tipo: "SAIDA", loteId: lt.id, quantidade: 80 + i * 20, unidade: "caixas",
            clienteId: cli.id, notaFiscal: `NF-${10000 + i * 7}`,
            transportadora: "TransLog SA", placaVeiculo: `ABC-${1000 + i}`,
            temperaturaC: 6.5, responsavel: "Op. Expedição", data: diasAtras(3 - i),
          },
        });
      }
    }
    log.push("Movimentações de estoque criadas (entradas + saídas)");
  }

  // SAC — 2 reclamações.
  const sacCount = await prisma.sAC.count();
  if (sacCount === 0) {
    const clienteSAC = await prisma.cliente.findFirst();
    if (clienteSAC) {
      await prisma.sAC.create({
        data: {
          numero: "SAC-2026-001", clienteId: clienteSAC.id,
          canal: "TELEFONE", tipo: "QUALIDADE", urgencia: "ALTA",
          descricao: "Cliente relata sabor metálico em garrafa do lote L-DEMO-1002.",
          lote: "L-DEMO-1002",
          status: "EM_INVESTIGACAO", prazo: diasFrente(2),
        },
      });
      await prisma.sAC.create({
        data: {
          numero: "SAC-2026-002", clienteId: clienteSAC.id,
          canal: "EMAIL", tipo: "EMBALAGEM", urgencia: "MEDIA",
          descricao: "Tampa danificada em 3 garrafas do pallet recebido.",
          status: "ABERTA", prazo: diasFrente(5),
        },
      });
      log.push("2 SACs de exemplo criados");
    }
  }

  // Rótulos — 2 lotes (1 aprovado + 1 em análise).
  const rotCount = await prisma.rotulo.count();
  if (rotCount === 0) {
    const checklistAprovado = JSON.stringify({
      denominacao: "CONFORME", registroMAPA: "CONFORME", marca: "CONFORME",
      ingredientes: "CONFORME", aditivos: "CONFORME", alergenos: "CONFORME",
      fabricante: "CONFORME", endereco: "CONFORME", registroEstab: "CONFORME",
      volume: "CONFORME", lote: "CONFORME", validade: "CONFORME",
      tabelaNutri: "CONFORME", codigoBarras: "CONFORME", legibilidade: "CONFORME",
    });
    await prisma.rotulo.create({
      data: {
        fornecedor: "Gráfica Rótulos Brasil", loteFornecedor: "GRB-2026-0042",
        produtoId: produto.id, quantidade: 50000, numeroNF: "NF-GRB-7788",
        status: "APROVADO", checklist: checklistAprovado,
      },
    });
    await prisma.rotulo.create({
      data: {
        fornecedor: "Embalagens Norte Ltda", loteFornecedor: "EMB-9911",
        produtoId: produto.id, quantidade: 20000,
        status: "EM_ANALISE", checklist: checklistAprovado,
      },
    });
    log.push("2 lotes de rótulos criados");
  }

  // Recall — 1 recall classe III (rotulagem) com retornos.
  const recallCount = await prisma.recall.count();
  if (recallCount === 0 && todosLotes.length > 0) {
    const clientesRec = await prisma.cliente.findMany({ take: 3 });
    const lotesAfetados = todosLotes.slice(0, 1).map((l) => l.id);
    const recall = await prisma.recall.create({
      data: {
        numero: "RC-2026-001", lotesIds: lotesAfetados.join(","),
        motivo: "ROTULAGEM", nivel: "CLASSE_III",
        descricao: "Erro de impressão na data de validade (dia trocado) — recall preventivo.",
        responsavel: "Patricio Ferreira (RT)",
        dataIdentificacao: diasAtras(10),
        dataMAPA: diasAtras(9), protocoloMAPA: "MAPA-RC-2026-09988",
        status: "EM_ANDAMENTO",
      },
    });
    for (const c of clientesRec) {
      await prisma.recallRetorno.create({
        data: { recallId: recall.id, clienteId: c.id, qtdNotificada: 50, status: "NOTIFICADO" },
      });
    }
    log.push("1 recall (RC-2026-001) classe III criado");
  }

  // Especificações de aprovação no insumo (1 insumo demo, se existir).
  const insumoDemo = await prisma.insumo.findFirst({ where: { tipo: { in: ["ACUCAR", "CO2", "CONCENTRADO"] } } });
  if (insumoDemo) {
    const especCount = await prisma.especificacaoInsumo.count({ where: { insumoId: insumoDemo.id } });
    if (especCount === 0) {
      await prisma.especificacaoInsumo.createMany({
        data: [
          { insumoId: insumoDemo.id, parametro: "Pureza", minimo: 99.5, maximo: null, unidade: "%", metodo: "AOAC 906.03", obrigatorio: true },
          { insumoId: insumoDemo.id, parametro: "Umidade", minimo: 0, maximo: 0.04, unidade: "%", metodo: "ICUMSA GS2/1/3-15", obrigatorio: true },
          { insumoId: insumoDemo.id, parametro: "Cor (ICUMSA)", minimo: 0, maximo: 45, unidade: "UI", metodo: "ICUMSA GS2/3-9", obrigatorio: true },
        ],
      });
      log.push(`3 especificações criadas no insumo ${insumoDemo.codigo}`);
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
    formulacoes: await prisma.formulacao.count(),
    avaliacoesSensoriais: await prisma.avaliacaoSensorial.count(),
    controleAgua: await prisma.controleAgua.count(),
    pontosTemperatura: await prisma.pontoTemperatura.count(),
    registrosTemperatura: await prisma.registroTemperatura.count(),
    movimentacoesEstoque: await prisma.movimentacaoEstoque.count(),
    sacs: await prisma.sAC.count(),
    rotulos: await prisma.rotulo.count(),
    recalls: await prisma.recall.count(),
  };

  return NextResponse.json({ ok: true, counts, log });
}
