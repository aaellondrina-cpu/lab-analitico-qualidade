# PROMPT FINAL — LIMS Completo para Indústria de Refrigerantes e Bebidas

## CONTEXTO
Sistema LIMS completo para laboratório de controle de qualidade de indústria
de refrigerantes e bebidas. Next.js 14, TypeScript, Tailwind CSS, Prisma + 
PostgreSQL (Neon), NextAuth.js. Deploy no Vercel, GitHub: LAB-ANALITICS-AAEL/lims-qualidade.

## IDENTIDADE VISUAL
- Logo SVG: gota d'água estilizada + símbolo de molécula, minimalista
- Nome: "LimsQual — Controle de Qualidade"
- Cores: azul petróleo #0D3B5E | azul água #00B4D8 | branco
- Fonte: DM Sans ou Geist

---

## FLUXO REAL DA INDÚSTRIA DE REFRIGERANTES

O sistema deve acompanhar TODO o fluxo de produção:

```
RECEBIMENTO DE MATÉRIAS-PRIMAS E INSUMOS
        ↓
ANÁLISE E LIBERAÇÃO (ou REJEIÇÃO) de cada insumo
        ↓
PREPARAÇÃO DO XAROPE SIMPLES (água + açúcar/edulcorante)
        ↓
ANÁLISE DO XAROPE SIMPLES
        ↓
PREPARAÇÃO DO XAROPE COMPOSTO (+ concentrado/essência/corante/acidulante/conservante)
        ↓
ANÁLISE DO XAROPE COMPOSTO → LIBERAÇÃO PARA ENVASE
        ↓
CARBONATAÇÃO E ENVASE (garrafa PET / vidro / lata)
        ↓
ANÁLISE DO PRODUTO ACABADO (amostra por lote)
        ↓
LIBERAÇÃO DO LOTE → EXPEDIÇÃO
        ↓
ANÁLISE DE RETENÇÃO (amostra guardada por prazo definido)
```

---

## MÓDULO 1 — CADASTROS BASE

### 1.1 Produtos Acabados
- Nome | Código | Sabor | Volume (200ml, 350ml, 600ml, 1L, 1,5L, 2L, 3L)
- Tipo de embalagem: PET | Vidro retornável | Vidro não retornável | Lata alumínio
- Versão: Regular | Diet | Light | Zero açúcar | Zero sódio
- Validade (dias) | Temperatura de armazenamento
- Especificações técnicas obrigatórias:

#### Parâmetros Físico-Químicos Obrigatórios (por produto):
| Parâmetro | Unidade | Mín | Máx | Método |
|-----------|---------|-----|-----|--------|
| pH | - | - | - | AOAC 943.02 |
| °Brix (sólidos solúveis) | °Brix | - | - | AOAC 932.12 |
| Densidade | g/mL | - | - | AOAC 945.06 |
| CO2 (carbonatação) | volumes | - | - | ABNT NBR 13793 |
| Acidez total titulável | g/100mL | - | - | IAL 310/IV |
| Cor (absorbância) | AU | - | - | - |
| Turbidez | NTU | - | - | - |
| Teor de álcool | % v/v | - | - | (apenas alcoólicas) |

#### Parâmetros Microbiológicos (por produto):
| Parâmetro | Unidade | Máximo | Legislação |
|-----------|---------|--------|------------|
| Coliformes totais | NMP/mL | - | RDC 331/2019 |
| Bolores e Leveduras | UFC/mL | - | RDC 331/2019 |
| Bactérias heterotróficas | UFC/mL | - | - |

### 1.2 Matérias-Primas e Insumos
Cadastro completo de todos os insumos utilizados na produção:

#### Insumos Principais:
- **Água de processo** — tratada, com laudo de potabilidade
- **Açúcar cristal / HFCS** — grau alimentício
- **CO2 grau alimentício** — certificado, pureza ≥99,9%
- **Concentrados e essências** — por sabor e fornecedor
- **Edulcorantes** — aspartame, acessulfame-K, sucralose, etc.
- **Acidulantes** — ácido cítrico, ácido fosfórico, ácido ascórbico
- **Conservantes** — benzoato de sódio, sorbato de potássio
- **Corantes** — caramelo IV, corantes naturais e artificiais
- **Dióxido de enxofre** (algumas formulações)

Campos por insumo:
- Nome | Código | Fornecedor | CNPJ Fornecedor
- Número do lote do fornecedor | Data de fabricação | Validade
- Certificado de análise do fornecedor (upload PDF)
- Especificações de aprovação (min/máx por parâmetro)
- Status: APROVADO | REPROVADO | EM ANÁLISE | QUARENTENA

### 1.3 Embalagens
Controle de qualidade das embalagens:

#### Garrafa PET:
- Fornecedor | Lote | Volume nominal
- Peso da garrafa (g) | Espessura da parede (mm)
- Resistência à pressão interna (bar)
- Torque de abertura da tampa (N.cm)
- Permeabilidade ao CO2
- Conformidade dimensional
- Inspeção visual (trincas, contaminações, deformações)

#### Garrafa Vidro Retornável:
- Lote de retorno | Número de trips (usos)
- Inspeção visual: trincas, lascas, sujidade, odor
- Resultado da lavagem (microbiológico)
- Status: APROVADA | REJEITADA | DESCARTE

#### Tampa / Rolha:
- Fornecedor | Lote
- Torque de fechamento | Vedação
- Inspeção visual

#### Rótulo:
- Fornecedor | Lote
- Conformidade com legislação de rotulagem
- Legibilidade, data de validade impressa corretamente

### 1.4 Pontos de Coleta / Pontos de Amostragem
Mapa de todos os pontos de coleta na planta:
- **Recebimento de MP** — dock de recebimento
- **Tanque de água tratada** — saída do filtro
- **Tanque de xarope simples** — após dissolução
- **Tanque de xarope composto** — pré-envase
- **Linha de envase** — pós-enchedora (produto acabado)
- **CIP (Clean-In-Place)** — saída da solução de limpeza
- **Câmara fria** — temperatura de armazenamento
- **Expedição** — produto para distribuição
- **Swab de superfície** — equipamentos e utensílios
- **Ar ambiente** — sala de produção / sala limpa

### 1.5 Fornecedores
- Razão social | CNPJ | Responsável técnico
- Email | Telefone | Endereço
- Insumos fornecidos
- Histórico de aprovação/rejeição
- Certificações (ISO, FSSC, BPF)
- Avaliação de desempenho (% de aprovação)

### 1.6 Clientes / Indústrias Atendidas
- Razão social | CNPJ | Responsável | Email | Telefone
- Produtos que consome
- Histórico de análises e laudos

---

## MÓDULO 2 — ORDENS DE SERVIÇO E LOTES DE PRODUÇÃO

### 2.1 Lote de Produção
Cada lote produzido recebe:
- **Número do lote** (gerado: LOTE-2026-0001)
- Data/hora de início da produção
- Data/hora de término
- Produto fabricado | Volume produzido (litros) | Unidades produzidas
- Linha de produção (Linha 1, Linha 2...)
- Turno: Manhã | Tarde | Noite
- Responsável de produção
- Status do lote:
  - **EM PRODUÇÃO** (amarelo)
  - **AGUARDANDO ANÁLISE** (laranja)
  - **APROVADO** (verde)
  - **REPROVADO** (vermelho)
  - **REPROCESSO** (azul)
  - **EXPEDIDO** (cinza)

### 2.2 Rastreabilidade do Lote
Para cada lote, o sistema consolida automaticamente:
- Todos os insumos utilizados (com lotes dos fornecedores)
- Todos os resultados de análise em cada etapa
- Quem analisou, quando, com qual equipamento
- Resultado geral: APROVADO / REPROVADO
- Relatório de rastreabilidade completo (PDF)

### 2.3 Registro de Produção — Consumo de Insumos
Por lote, registrar insumos consumidos:
- Insumo | Lote do insumo | Quantidade utilizada | Unidade
- Isso garante rastreabilidade bidirecional:
  * Dado um lote de produto: quais insumos foram usados?
  * Dado um lote de insumo: em quais produtos foi utilizado?

---

## MÓDULO 3 — ENTRADA E ANÁLISE DE AMOSTRAS

### 3.1 Registro de Amostra (OS)
- **Número OS** (automático: OS-2026-0001)
- Tipo de amostra:
  - Matéria prima / Insumo
  - Xarope simples
  - Xarope composto
  - Produto acabado (lote)
  - Embalagem (PET / Vidro / Tampa)
  - Água de processo
  - CIP (limpeza)
  - Swab de superfície
  - Ar ambiente
  - Retenção
  - Reclamação de cliente
  - Auditoria
- Lote vinculado | Insumo vinculado | Fornecedor
- Ponto de coleta | Responsável pela coleta
- Data/hora coleta | Data/hora recebimento
- Condições de transporte: temperatura, integridade
- Prazo de entrega do laudo
- Analista responsável

### 3.2 Status da OS
```
RECEBIDA → EM ANÁLISE → AGUARDANDO APROVAÇÃO → APROVADO → LAUDO EMITIDO
```

### 3.3 Lançamento de Resultados
Por parâmetro:
- Valor obtido | Unidade
- Método analítico utilizado
- Equipamento (com nº série e status de calibração)
- Data/hora do ensaio | Analista
- **Conformidade automática** comparando com especificação:
  - ✅ CONFORME
  - ❌ NÃO CONFORME (abre NC automaticamente)
  - ⚠️ ATENÇÃO (±10% do limite)

---

## MÓDULO 4 — DASHBOARD OPERACIONAL

### Cards de Métricas (tempo real):
- Lotes em produção hoje
- OS em análise
- Laudos pendentes
- NCs abertas
- Insumos em quarentena
- Calibrações vencendo (próximos 7 dias)

### Gráficos:
- Aprovação de lotes por período (barras)
- Tendência de pH, °Brix, CO2 por produto (linha — últimos 30 lotes)
- OS por tipo de amostra (pizza)
- Ranking de parâmetros com mais NCs

### Alertas em destaque:
- Lotes aguardando resultado há mais de X horas
- Insumos com validade vencendo em 30 dias
- Equipamentos com calibração vencida ou próxima
- NCs sem ação corretiva definida

---

## MÓDULO 5 — LAUDOS E CERTIFICADOS

### 5.1 Laudo de Análise (por OS)
PDF gerado automaticamente:
- Logo + dados do laboratório
- Número do laudo | OS | Data
- Dados do cliente/fornecedor
- Produto | Lote | Ponto de coleta
- Tabela: Parâmetro | Resultado | Unidade | Especificação | Conformidade
- Conclusão: **APROVADO / REPROVADO / APROVADO COM RESTRIÇÕES**
- Responsável técnico + assinatura
- QR Code de verificação de autenticidade

### 5.2 Certificado de Análise (CoA)
Para liberação de insumos ao fornecedor:
- Formato padrão CoA
- Todos os parâmetros analisados
- Status: APROVADO / REPROVADO

### 5.3 Relatório de Rastreabilidade do Lote
Um único PDF com:
- Todos os insumos do lote (com lotes de origem)
- Todas as análises realizadas (todas as etapas)
- % de conformidade geral
- Histórico de decisões

### 5.4 Boletim de Qualidade Mensal
- Resumo estatístico do mês
- % de aprovação por produto
- Parâmetros fora de especificação mais frequentes
- Gráfico de tendências

---

## MÓDULO 6 — NÃO CONFORMIDADES (NC)

Abertura automática quando resultado fora do limite:
- Número NC (NC-2026-0001)
- Produto/Insumo/Lote afetado
- Parâmetro | Valor obtido | Limite
- **Disposição imediata** (decisão obrigatória):
  - Liberar — justificativa técnica obrigatória
  - Reter lote — aguardar reanálise
  - Reprocessar — detalhar ação
  - Descarte — autorização gerencial
- Análise de causa raiz (5 Porquês ou Ishikawa)
- Ação corretiva | Responsável | Prazo
- Verificação da eficácia
- Status: ABERTA | EM TRATAMENTO | ENCERRADA | RECORRENTE

Relatório de recorrência: quantas NCs por produto/parâmetro nos últimos 6 meses

---

## MÓDULO 7 — CONTROLE DE EQUIPAMENTOS

Todos os equipamentos do laboratório:
- **pHmetro** | **Refratômetro** | **Densímetro** | **Carbonatômetro**
- **Balança analítica** | **Espectrofotômetro** | **Turbidímetro**
- **Autoclave** | **Estufa** | **Banho-maria** | **Geladeira de amostra**
- Termômetro | Medidor de CO2

Campos:
- Nome | Modelo | Fabricante | Nº série | Patrimônio
- Data última calibração | Data próxima calibração
- Responsável pela calibração | Laboratório calibrador
- Certificado de calibração (upload PDF)
- Status: CALIBRADO ✅ | VENCIDO ❌ | PRÓXIMO (⚠️ 30 dias)
- Histórico de manutenções

---

## MÓDULO 8 — AUDITORIA E CONFORMIDADE

### Checklist de BPF (Boas Práticas de Fabricação):
- Higiene pessoal dos manipuladores
- Limpeza e sanitização de equipamentos
- Controle de pragas
- Controle de temperatura da câmara fria
- Condições das instalações

### Registros de CIP (Clean-In-Place):
- Data | Linha/Tanque | Responsável
- Concentração da solução de limpeza
- Temperatura | Tempo de contato
- Resultado microbiológico pós-CIP
- Status: APROVADO | REPROCESSAR

### Programa de Análise Sensorial:
- Painel de degustação por lote
- Avaliação: Cor | Odor | Sabor | Carbonatação | Aparência
- Escala hedônica 1-9
- Aprovado / Rejeitado

---

## BANCO DE DADOS — SCHEMA PRISMA COMPLETO

```prisma
model Produto {
  id           String          @id @default(cuid())
  nome         String
  codigo       String          @unique
  sabor        String
  volume       Float
  tipoEmbalagem String
  versao       String
  validade     Int
  especificacoes Especificacao[]
  lotes        LoteProducao[]
  createdAt    DateTime        @default(now())
}

model Especificacao {
  id         String  @id @default(cuid())
  produto    Produto @relation(fields: [produtoId], references: [id])
  produtoId  String
  parametro  String
  tipo       String  // FISICOQUIMICO | MICROBIOLOGICO | SENSORIAL
  minimo     Float?
  maximo     Float?
  unidade    String
  metodo     String?
  legislacao String?
}

model Insumo {
  id           String    @id @default(cuid())
  nome         String
  codigo       String    @unique
  tipo         String    // AGUA | ACUCAR | CO2 | CONCENTRADO | ACIDULANTE | etc
  fornecedor   Fornecedor @relation(fields: [fornecedorId], references: [id])
  fornecedorId String
  lotesFornecedor LoteInsumo[]
  createdAt    DateTime  @default(now())
}

model LoteInsumo {
  id              String   @id @default(cuid())
  insumo          Insumo   @relation(fields: [insumoId], references: [id])
  insumoId        String
  lotesFornecedor String
  dataFabricacao  DateTime
  dataValidade    DateTime
  quantidade      Float
  unidade         String
  status          String   @default("EM_ANALISE")
  amostras        Amostra[]
  consumos        ConsumoInsumo[]
  createdAt       DateTime @default(now())
}

model Embalagem {
  id         String   @id @default(cuid())
  tipo       String   // PET | VIDRO_RETORNAVEL | VIDRO_NAO_RETORNAVEL | LATA | TAMPA
  fornecedor String
  lote       String
  volume     Float
  status     String   @default("EM_ANALISE")
  amostras   Amostra[]
  createdAt  DateTime @default(now())
}

model LoteProducao {
  id               String     @id @default(cuid())
  numero           String     @unique
  produto          Produto    @relation(fields: [produtoId], references: [id])
  produtoId        String
  dataInicio       DateTime
  dataFim          DateTime?
  volumeProduzido  Float?
  unidadesProduzidas Int?
  linha            String
  turno            String
  responsavel      String
  status           String     @default("EM_PRODUCAO")
  amostras         Amostra[]
  consumos         ConsumoInsumo[]
  createdAt        DateTime   @default(now())
}

model ConsumoInsumo {
  id           String       @id @default(cuid())
  lote         LoteProducao @relation(fields: [loteId], references: [id])
  loteId       String
  loteInsumo   LoteInsumo   @relation(fields: [loteInsumoId], references: [id])
  loteInsumoId String
  quantidade   Float
  unidade      String
}

model Amostra {
  id              String       @id @default(cuid())
  numeroOS        String       @unique
  tipo            String
  lote            LoteProducao? @relation(fields: [loteId], references: [id])
  loteId          String?
  loteInsumo      LoteInsumo?  @relation(fields: [loteInsumoId], references: [id])
  loteInsumoId    String?
  embalagem       Embalagem?   @relation(fields: [embalagemId], references: [id])
  embalagemId     String?
  pontoColeta     String
  responsavelColeta String
  dataColeta      DateTime
  dataRecebimento DateTime     @default(now())
  prazoEntrega    DateTime
  analista        String
  status          String       @default("RECEBIDA")
  resultados      Resultado[]
  createdAt       DateTime     @default(now())
}

model Resultado {
  id           String   @id @default(cuid())
  amostra      Amostra  @relation(fields: [amostraId], references: [id])
  amostraId    String
  parametro    String
  valor        Float
  unidade      String
  metodo       String?
  equipamento  Equipamento? @relation(fields: [equipamentoId], references: [id])
  equipamentoId String?
  conformidade String
  analista     String
  dataEnsaio   DateTime @default(now())
  nc           NaoConformidade?
}

model NaoConformidade {
  id           String   @id @default(cuid())
  numero       String   @unique
  resultado    Resultado @relation(fields: [resultadoId], references: [id])
  resultadoId  String   @unique
  disposicao   String
  causaRaiz    String?
  acaoCorretiva String?
  responsavel  String?
  prazo        DateTime?
  status       String   @default("ABERTA")
  createdAt    DateTime @default(now())
}

model Equipamento {
  id                String     @id @default(cuid())
  nome              String
  modelo            String
  fabricante        String
  numeroSerie       String     @unique
  patrimonio        String?
  ultimaCalibracao  DateTime
  proximaCalibracao DateTime
  status            String
  resultados        Resultado[]
  createdAt         DateTime   @default(now())
}

model Fornecedor {
  id           String   @id @default(cuid())
  razaoSocial  String
  cnpj         String   @unique
  responsavel  String
  email        String
  telefone     String
  insumos      Insumo[]
  createdAt    DateTime @default(now())
}

model Cliente {
  id          String   @id @default(cuid())
  razaoSocial String
  cnpj        String   @unique
  responsavel String
  email       String
  telefone    String
  createdAt   DateTime @default(now())
}

model RegistroCIP {
  id              String   @id @default(cuid())
  equipamento     String
  responsavel     String
  concentracao    Float
  temperatura     Float
  tempoContato    Int
  resultadoMicro  String?
  status          String
  data            DateTime @default(now())
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      String   @default("ANALISTA")
  createdAt DateTime @default(now())
}
```

---

## PÁGINAS / ROTAS

```
/ → Landing page profissional
/login → Autenticação

/dashboard → Painel operacional em tempo real

/lotes → Lista de lotes de produção
/lotes/novo → Registrar novo lote
/lotes/[id] → Detalhe + rastreabilidade completa

/amostras → Lista de OS
/amostras/nova → Registrar nova amostra
/amostras/[id] → Detalhe + lançar resultados

/insumos → Gestão de insumos e matérias-primas
/insumos/[id] → Detalhe + histórico de lotes

/embalagens → Controle de qualidade de embalagens

/produtos → Cadastro de produtos e especificações
/fornecedores → Gestão de fornecedores
/clientes → Gestão de clientes

/laudos → Emissão e histórico de laudos
/nao-conformidades → Gestão de NCs
/equipamentos → Gestão de equipamentos e calibrações
/cip → Registros de limpeza CIP
/relatorios → Relatórios, rastreabilidade, boletins
```

---

## VARIÁVEIS DE AMBIENTE
```
DATABASE_URL=postgresql://neondb_owner:...@neon.tech/neondb
NEXTAUTH_SECRET=aael-lims-qualidade-secret-2026
NEXTAUTH_URL=https://lims-qualidade.vercel.app
NODE_ENV=production
```

---

## REFERÊNCIAS NORMATIVAS
- RDC ANVISA 331/2019 — Padrões microbiológicos para alimentos
- IN MAPA 27/2009 — Bebidas não alcoólicas
- Lei 8.918/1994 — Bebidas em geral
- Portaria SVS/MS 888/2021 — Água potável
- ABNT NBR 13793 — Carbonatação de bebidas
- ISO 22000 / FSSC 22000 — Segurança de alimentos
- ISO 17025 — Competência de laboratórios
- RDC 216/2004 — Boas Práticas de Fabricação

---

## MÓDULO 9 — CONFIGURAÇÕES DO LABORATÓRIO (CABEÇALHO DOS LAUDOS)

### 9.1 Dados Institucionais do Laboratório
Tudo que aparece no cabeçalho de TODOS os laudos, relatórios e certificados:

#### Identificação:
- Razão Social do Laboratório
- Nome Fantasia
- CNPJ | Inscrição Estadual
- Endereço completo | CEP | Cidade | Estado
- Telefone | Email | Site
- Logo (upload de imagem)

#### Responsável Técnico (RT):
- Nome completo do RT
- Formação / Titulação (ex: Farmacêutico, Químico, Biólogo)
- Número do CRF / CRQ / CRBio (registro profissional)
- Assinatura digital (upload de imagem da assinatura)

#### Autorizações e Registros Obrigatórios:
- **Autorização MAPA** — Ministério da Agricultura, Pecuária e Abastecimento
  * Número da autorização | Data de validade
- **Registro ANVISA** — Agência Nacional de Vigilância Sanitária
  * Número de registro | Data de validade
- **Acreditação INMETRO / CGCRE** — ISO/IEC 17025
  * Número do certificado de acreditação (ex: CRL-XXXX)
  * Data de validade | Escopo de acreditação
- **Licença Vigilância Sanitária Estadual / Municipal**
  * Número | Órgão emissor | Data de validade
- **IBAMA** (se aplicável — resíduos laboratoriais)
  * Número do cadastro
- **Outros órgãos** (campo livre para adicionar)

### 9.2 Modelo do Cabeçalho nos Laudos (PDF)

```
┌─────────────────────────────────────────────────────────────────┐
│  [LOGO]    NOME DO LABORATÓRIO                                  │
│            CNPJ: XX.XXX.XXX/XXXX-XX                            │
│            Endereço | Tel | Email                               │
├─────────────────────────────────────────────────────────────────┤
│  RT: Nome do Responsável Técnico — CRF/CRQ/CRBio nº XXXXX      │
│  Autorização MAPA nº XXXXXX | ANVISA nº XXXXXX                  │
│  Acreditado INMETRO CRL-XXXX — ISO/IEC 17025                    │
├─────────────────────────────────────────────────────────────────┤
│  LAUDO DE ANÁLISE Nº XXXXX/2026                                 │
│  OS: OS-2026-0001 | Data: DD/MM/AAAA                           │
└─────────────────────────────────────────────────────────────────┘
```

### 9.3 Rodapé dos Laudos
- "Este laudo só é válido na íntegra. Reprodução parcial requer autorização."
- "Laboratório acreditado pelo INMETRO conforme ABNT NBR ISO/IEC 17025"
- QR Code de verificação de autenticidade
- Número de páginas (Página X de Y)
- Data e hora de emissão

### 9.4 Tela de Configuração no Sistema
Menu: **Configurações → Dados do Laboratório**
- Formulário para preencher todos os dados acima
- Upload da logo
- Upload da assinatura do RT
- Pré-visualização do cabeçalho em tempo real
- Salvo no banco de dados e aplicado automaticamente em todos os documentos

