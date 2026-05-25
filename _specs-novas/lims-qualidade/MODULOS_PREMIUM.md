# MÓDULOS PREMIUM — Adicionar ao sistema LIMS existente

## MÓDULO 10 — CONTROLE ESTATÍSTICO DE PROCESSO (CEP/SPC)

### Objetivo
Monitorar parâmetros críticos (pH, °Brix, CO2) ao longo do tempo e detectar
desvios ANTES de virarem não conformidade. Sistema preventivo, não reativo.
Referência: Ambev, Coca-Cola, ISO 17025.

### Página: /cep

#### Cartas de Controle (Shewhart):
- Carta X̄ (média) — monitora valor central do parâmetro
- Carta R (amplitude) — monitora variação entre medições
- Geradas automaticamente com os resultados já lançados no sistema

#### Limites calculados automaticamente:
- LCS (Limite de Controle Superior) = média + 3σ
- LC (Linha Central) = média histórica
- LCI (Limite de Controle Inferior) = média − 3σ
- LSE / LIE (Limites de Especificação) — vindos do cadastro do produto

#### Sinais de alerta automáticos (Regras de Nelson):
- Ponto fora dos limites de controle → alerta imediato
- 7 pontos consecutivos acima ou abaixo da linha central → tendência
- 7 pontos consecutivos em sequência crescente ou decrescente → deriva
- Ao detectar sinal → notificação no dashboard + sugestão de investigação

#### Índices de Capacidade (Cp e Cpk):
- Cp (capacidade potencial) — o processo é capaz?
- Cpk (capacidade real) — o processo está centrado?
- Classificação automática:
  - Cpk ≥ 1,33 → PROCESSO CAPAZ ✅
  - 1,00 ≤ Cpk < 1,33 → ATENÇÃO ⚠️
  - Cpk < 1,00 → PROCESSO INCAPAZ ❌

#### Parâmetros monitorados por padrão:
- pH do produto acabado
- °Brix (xarope simples, composto e produto acabado)
- Volumes de CO2
- Acidez titulável
- (configurável — qualquer parâmetro cadastrado)

#### Banco de dados — adicionar ao schema:
```prisma
model CartaControle {
  id          String   @id @default(cuid())
  produto     String
  parametro   String
  media       Float
  desvio      Float
  lcs         Float
  lci         Float
  cp          Float?
  cpk         Float?
  updatedAt   DateTime @updatedAt
}
```

---

## MÓDULO 11 — PLANO APPCC / HACCP

### Objetivo
Atender exigências da ISO 22000, FSSC 22000 e RDC 216/ANVISA.
Cadastro e monitoramento dos Pontos Críticos de Controle (PCC) da linha de produção.

### Página: /appcc

#### Cadastro de Perigos (Análise de Perigos):
- Etapa do processo (ex: Pasteurização, Carbonatação, Envase)
- Tipo de perigo: Biológico | Químico | Físico | Radiológico
- Descrição do perigo (ex: Sobrevivência de patógenos)
- Probabilidade de ocorrência: Alta | Média | Baixa
- Severidade: Alta | Média | Baixa
- Medida de controle aplicada
- É PCC? Sim / Não (definido pela árvore decisória do Codex)

#### Cadastro de PCCs (Pontos Críticos de Controle):
- Número do PCC (PCC-01, PCC-02...)
- Etapa do processo
- Perigo controlado
- Limite crítico (valor mínimo e/ou máximo)
- Procedimento de monitoramento
- Frequência de monitoramento
- Responsável pelo monitoramento
- Ação corretiva se limite for ultrapassado
- Registro vinculado (OS do sistema)

#### Monitoramento dos PCCs:
- Registro diário/por turno dos valores medidos em cada PCC
- Comparação automática com limite crítico
- Se ultrapassar limite → abre NC automaticamente + alerta ao responsável
- Histórico completo por PCC

#### Banco de dados — adicionar ao schema:
```prisma
model PCC {
  id              String   @id @default(cuid())
  numero          String   @unique
  etapa           String
  perigo          String
  tipoPerigo      String
  limiteCriticoMin Float?
  limiteCriticoMax Float?
  unidade         String
  frequencia      String
  responsavel     String
  acaoCorretiva   String
  monitoramentos  MonitoramentoPCC[]
  createdAt       DateTime @default(now())
}

model MonitoramentoPCC {
  id          String   @id @default(cuid())
  pcc         PCC      @relation(fields: [pccId], references: [id])
  pccId       String
  valor       Float
  conforme    Boolean
  responsavel String
  observacao  String?
  data        DateTime @default(now())
}
```

---

## MÓDULO 12 — CONTROLE DE DOCUMENTOS E TREINAMENTOS

### Objetivo
Atender ISO 22000, ISO 17025 e FSSC 22000 no controle de versões de documentos
e registro de treinamentos. Exigência em qualquer auditoria de certificação.

### Página: /documentos

#### Gestão de Documentos:
- Tipos: POP | ITP | Formulário | Manual | Procedimento | Especificação
- Campos: Código | Título | Versão | Data de aprovação | Responsável
- Upload do arquivo (PDF)
- Status: VIGENTE | OBSOLETO | EM REVISÃO
- Controle de versões — histórico de todas as versões anteriores
- Quando nova versão for aprovada, versão anterior vai automaticamente para OBSOLETO
- Alerta de revisão periódica (configurável — ex: a cada 12 meses)

#### Gestão de Treinamentos:
- Colaborador | Cargo | Setor
- Documento/procedimento treinado
- Data do treinamento | Instrutor
- Forma: Presencial | Online | On the job
- Status: TREINADO ✅ | VENCIDO ❌ | NÃO TREINADO ⚠️
- Validade do treinamento (configurável — ex: anual)
- Registro de assinatura (upload ou campo)

#### Matriz de Treinamento:
- Tabela cruzada: colaboradores × documentos
- Verde = treinado e vigente
- Amarelo = vencendo em 30 dias
- Vermelho = vencido ou não treinado
- Filtro por setor/cargo

#### Banco de dados — adicionar ao schema:
```prisma
model Documento {
  id          String   @id @default(cuid())
  codigo      String
  titulo      String
  tipo        String
  versao      String
  arquivo     String?
  status      String   @default("VIGENTE")
  aprovadoPor String
  dataAprovacao DateTime
  revisaoEm  DateTime?
  treinamentos Treinamento[]
  createdAt   DateTime @default(now())
}

model Colaborador {
  id          String   @id @default(cuid())
  nome        String
  cargo       String
  setor       String
  email       String?
  ativo       Boolean  @default(true)
  treinamentos Treinamento[]
  createdAt   DateTime @default(now())
}

model Treinamento {
  id            String      @id @default(cuid())
  colaborador   Colaborador @relation(fields: [colaboradorId], references: [id])
  colaboradorId String
  documento     Documento   @relation(fields: [documentoId], references: [id])
  documentoId   String
  dataRealizado DateTime
  instrutor     String
  forma         String
  validade      DateTime?
  status        String      @default("TREINADO")
  createdAt     DateTime    @default(now())
}
```

---

## MÓDULO 13 — PORTAL DO CLIENTE

### Objetivo
Página separada onde o cliente acessa seus próprios laudos com login dedicado,
sem precisar contatar o laboratório. Padrão exigido por grandes redes e indústrias.

### Página: /portal (acesso público com login)

#### Login do Cliente:
- Email + senha (cadastrado pelo laboratório)
- Tela separada do login interno do laboratório
- Após login → acessa APENAS os dados da sua empresa

#### O que o cliente vê:
- **Dashboard próprio:**
  - Total de amostras no período
  - Laudos disponíveis para download
  - % de aprovação dos seus produtos
  - Últimas análises

- **Lista de Laudos:**
  - Filtros: período, produto, lote, status
  - Botão "Download PDF" para cada laudo emitido
  - Status: APROVADO (verde) | REPROVADO (vermelho) | PENDENTE (amarelo)

- **Histórico por Produto:**
  - Evolução dos parâmetros ao longo do tempo (gráfico)
  - Comparativo entre lotes

- **Notificações:**
  - Email automático quando laudo fica disponível
  - Email quando resultado for não conforme

#### O que o cliente NÃO vê:
- Dados de outros clientes
- Informações internas do laboratório
- Módulos operacionais (equipamentos, NCs internas, etc.)

#### Banco de dados — adicionar ao schema:
```prisma
model ClienteUser {
  id          String   @id @default(cuid())
  clienteId   String
  email       String   @unique
  password    String
  nome        String
  ativo       Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

---

## ROTAS A ADICIONAR:
```
/cep                → Controle Estatístico de Processo
/appcc              → Plano APPCC/HACCP + monitoramento PCCs
/documentos         → Gestão de documentos e treinamentos
/portal             → Portal do cliente (login separado)
/portal/dashboard   → Dashboard do cliente
/portal/laudos      → Laudos do cliente
```

## ADICIONAR NO MENU DE NAVEGAÇÃO INTERNO:
- /cep → ícone de gráfico de linha
- /appcc → ícone de escudo
- /documentos → ícone de arquivo
- (portal é acesso externo, não aparece no menu interno)

## ALERTAS NO DASHBOARD PRINCIPAL — adicionar:
- PCCs com leitura atrasada (não registrada no prazo)
- Documentos com revisão vencida
- Colaboradores com treinamento vencido
- Processo com Cpk < 1,00 (incapaz)
