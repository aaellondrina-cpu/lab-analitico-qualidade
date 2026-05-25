# COMPLEMENTO — Conformidade com o MAPA para Indústria de Bebidas

## BASE LEGAL
- Lei nº 8.918/1994 — padronização, classificação, registro, inspeção e fiscalização de bebidas
- Decreto nº 6.871/2009 — regulamenta a Lei 8.918/94 (alterado em 2025)
- Portaria SDA/MAPA nº 1343/2025 — BPF e controle de elaboração de bebidas
- Portaria MAPA nº 747/2024 — credenciamento e fiscalização de laboratórios
- IN MAPA nº 55/2009 — coleta de amostras e procedimentos de análise

---

## O QUE O MAPA EXIGE E AINDA NÃO ESTÁ NO SISTEMA

---

### 1. REGISTRO DO ESTABELECIMENTO NO MAPA

Adicionar na tela de Configurações:

```
Seção: Registro MAPA do Estabelecimento
- Número de registro do estabelecimento no MAPA
- Data de concessão do registro
- Número do processo MAPA
- Superintendência Federal de Agricultura (SFA) responsável — estado
- Validade do registro
- Upload do certificado de registro
- Alerta automático quando vencer
```

> O Decreto 6.871/2009 e a Lei 8.918/94 exigem que todo fabricante de bebidas
> seja registrado no MAPA antes de iniciar a produção.

---

### 2. REGISTRO DE CADA PRODUTO NO MAPA

Adicionar no cadastro de Produtos:

```
Seção: Registro MAPA do Produto
- Número de registro do produto no MAPA
- Data de registro
- Número do processo
- Validade do registro (renovação obrigatória)
- Upload do certificado de registro do produto
- Alerta automático 60 dias antes do vencimento
```

> Art. 8º do Decreto 6.871/2009: todo produto deve ter registro no MAPA
> com aprovação do Padrão de Identidade e Qualidade (PIQ).

---

### 3. DECLARAÇÃO ANUAL DE PRODUÇÃO (DAP)

Novo módulo obrigatório:

```
Rota: /declaracao-anual

O que é: Todo estabelecimento deve declarar ao MAPA até 31 de janeiro
de cada ano a quantidade produzida e estoques do ano anterior.
(Decreto 6.871/2009)

Campos por produto:
- Produto | Registro MAPA
- Quantidade produzida no ano (litros ou unidades)
- Quantidade vendida no ano
- Estoque em 31/dezembro
- Unidade de medida

Funcionalidades:
- Sistema consolida automaticamente os dados dos lotes do ano
- Gera relatório no formato exigido pelo MAPA
- Registra data de envio à SFA
- Status: PENDENTE | ENVIADA | CONFIRMADA
- Alerta no dashboard em dezembro/janeiro
```

---

### 4. CONTROLE DE BPF — BOAS PRÁTICAS DE FABRICAÇÃO

(Portaria SDA/MAPA nº 1343/2025 — exigência específica para bebidas)

Adicionar módulo BPF com os seguintes registros obrigatórios:

```
Rota: /bpf

4.1 Controle de Elaboração de Bebidas (Art. 72 da Portaria 1343/2025)
- Registro de cada etapa de elaboração por lote:
  * Xarope simples: data, hora, responsável, quantidade
  * Xarope composto: data, hora, adição de cada ingrediente, responsável
  * Carbonatação: data, hora, volumes de CO₂, pressão
  * Envase: data, hora, linha, velocidade, responsável

4.2 Controle de Insumos com Análise (Art. 68-71 da Portaria 1343/2025)
- Critérios de análise de insumos baseados em risco do fornecedor
- Registro de cada análise realizada em insumo
- Resultado e medida adotada (aprovado/reprovado/ação junto ao fornecedor)
- Histórico por fornecedor

4.3 Controle de Equipamentos de Medição (Art. 40-41 da Portaria 1343/2025)
- Todo equipamento que influencia qualidade DEVE ter calibração registrada
  (já existe no módulo de Equipamentos — confirmar que está completo)
- Procedimento de controle de equipamentos de produção (não só do laboratório)
- Ex: termômetros de pasteurização, manômetros de carbonatação, balanças de produção

4.4 Registros BPF por turno:
- Higiene pessoal dos manipuladores (verificação diária)
- Limpeza de superfícies e equipamentos
- Controle de temperatura das câmaras
- Controle de pragas
- Condições das instalações
```

---

### 5. COLETA DE CONTRAPROVA (IN MAPA nº 55/2009)

Adicionar ao registro de Amostras:

```
Seção: Contraprova e Retenção

- Amostra de retenção (contraprova): quantidade retida por lote
  * Quantidade | Embalagem | Local de armazenamento | Prazo de guarda
- Código de identificação da amostra de contraprova
- Status: RETIDA | DESCARTADA (após prazo)
- Alerta quando prazo de descarte se aproximar
```

> A IN MAPA nº 55/2009 estabelece procedimentos obrigatórios para
> coleta, guarda e análise de contraprova de produtos.

---

### 6. LIVRO DE REGISTRO DE PRODUÇÃO (DIGITAL)

Adicionar relatório obrigatório:

```
Rota: /relatorios/livro-producao

O que é: registro cronológico de toda a produção, exigido pelo MAPA
para fiscalização. O sistema gera automaticamente com base nos lotes.

Colunas obrigatórias:
- Data | Produto | Registro MAPA | Lote | Volume produzido
- Insumos utilizados (por lote) | Análises realizadas | Status
- Exportar em PDF e Excel para apresentar ao fiscal do MAPA
```

---

### 7. ROTULAGEM — CONFORMIDADE (Decreto 6.871/2009, Arts. 10-13)

Adicionar checklist de rotulagem ao cadastro de Produtos:

```
Seção: Conformidade de Rotulagem (MAPA)

Campos obrigatórios no rótulo (verificação):
- [ ] Denominação do produto (nome conforme registro MAPA)
- [ ] Número de registro MAPA
- [ ] CNPJ do fabricante
- [ ] Endereço do estabelecimento
- [ ] Lote ou partida (código de rastreabilidade)
- [ ] Prazo de validade
- [ ] Volume líquido
- [ ] Lista de ingredientes e aditivos
- [ ] Graduação alcoólica (se aplicável)
- [ ] Informação nutricional
- [ ] Indicação "Contém/Não contém glúten" (se aplicável)
- [ ] Alerta para bebidas alcoólicas ("Beba com moderação" etc.)

Status da rotulagem: APROVADA | PENDENTE DE AJUSTE | EM ANÁLISE MAPA
Upload da arte do rótulo aprovada
```

---

### 8. ALERTAS REGULATÓRIOS NO DASHBOARD

Adicionar seção de alertas MAPA no dashboard principal:

```
Card: "Obrigações Regulatórias MAPA"
- Registro do estabelecimento vencendo (alerta 60 dias antes)
- Registros de produtos vencendo (alerta 60 dias antes)
- Declaração Anual de Produção pendente (alerta em dezembro)
- Produtos com rotulagem não aprovada
- Insumos sem análise obrigatória pendente
```

---

## ATUALIZAR O SCHEMA PRISMA

```prisma
model RegistroMAPA {
  id              String   @id @default(cuid())
  tipo            String   // ESTABELECIMENTO | PRODUTO
  numero          String
  dataConcessao   DateTime
  validade        DateTime?
  numeroProcesso  String?
  sfaEstado       String?
  produtoId       String?
  documentoUrl    String?
  status          String   @default("ATIVO")
  createdAt       DateTime @default(now())
}

model DeclaracaoAnual {
  id           String   @id @default(cuid())
  ano          Int
  produtoId    String
  qtdProduzida Float
  qtdVendida   Float
  estoque      Float
  unidade      String
  dataEnvio    DateTime?
  status       String   @default("PENDENTE")
  createdAt    DateTime @default(now())
}

model RegistroBPF {
  id          String   @id @default(cuid())
  loteId      String?
  etapa       String   // XAROPE_SIMPLES | XAROPE_COMPOSTO | CARBONATACAO | ENVASE
  data        DateTime
  responsavel String
  observacoes String?
  parametros  Json
  createdAt   DateTime @default(now())
}

model ContraProva {
  id              String   @id @default(cuid())
  amostraid       String
  quantidade      Float
  embalagem       String
  localArmazenamento String
  dataColeta      DateTime
  prazoDescarte   DateTime
  status          String   @default("RETIDA")
  createdAt       DateTime @default(now())
}
```

---

## ROTAS A ADICIONAR

```
/registro-mapa           → Registros do estabelecimento e produtos no MAPA
/declaracao-anual        → Declaração Anual de Produção
/bpf                     → Registros de Boas Práticas de Fabricação
/relatorios/livro-producao → Livro digital de produção para fiscalização
```

---

## ADICIONAR NO MENU LATERAL

```
Seção "Conformidade MAPA":
- Registro MAPA (ti-certificate)
- Declaração anual (ti-file-description)
- BPF (ti-clipboard-check)
- Livro de produção (ti-book)
```

---

## LEGISLAÇÃO DE REFERÊNCIA COMPLETA

```
Lei nº 8.918/1994          — Lei mãe das bebidas no Brasil
Decreto nº 6.871/2009      — Regulamenta a Lei 8.918/94
Decreto nº 12.709/2025     — Alterações recentes ao Decreto 6.871
Portaria SDA/MAPA 1343/2025 — BPF e controle de elaboração de bebidas
Portaria MAPA 747/2024     — Credenciamento de laboratórios
IN MAPA 55/2009            — Procedimentos de coleta e análise de amostras
IN MAPA 19/2003            — Registro de estabelecimentos e bebidas
IN MAPA 5/2005             — BPF para fabricação de bebidas
RDC ANVISA 331/2019        — Padrões microbiológicos
```

