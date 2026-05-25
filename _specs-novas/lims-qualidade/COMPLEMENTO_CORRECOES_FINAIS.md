# COMPLEMENTO — Correções Finais e Campos Faltantes

## 1. INSUMOS — Unidade de Medida e Especificações por Tipo

### Substituir a seção de insumos por esta versão completa:

Cada insumo cadastrado deve ter:

```
IDENTIFICAÇÃO:
- Nome do insumo
- Código interno
- Tipo (seleção obrigatória — define unidade padrão automaticamente)
- Fornecedor vinculado
- Unidade de medida padrão (preenchida automaticamente pelo tipo, editável)

TIPOS E UNIDADES PADRÃO AUTOMÁTICAS:
┌─────────────────────────────────┬──────────────────┬─────────────────────────────┐
│ Tipo de Insumo                  │ Unidade padrão   │ Especificações típicas       │
├─────────────────────────────────┼──────────────────┼─────────────────────────────┤
│ Água de processo                │ Litros (L)       │ pH, turbidez, coliformes     │
│ Açúcar cristal / HFCS           │ Quilograma (kg)  │ Pol, umidade, cinzas, cor    │
│ CO₂ grau alimentício            │ Quilograma (kg)  │ Pureza ≥99,9%, umidade, O₂  │
│ Concentrado / Essência          │ Litros (L)       │ Brix, pH, cor, odor          │
│ Edulcorante (aspartame etc.)    │ Quilograma (kg)  │ Pureza, umidade, granulom.   │
│ Acidulante (ác. cítrico etc.)   │ Quilograma (kg)  │ Pureza, umidade, cinzas      │
│ Conservante (benzoato etc.)     │ Quilograma (kg)  │ Pureza, umidade              │
│ Corante (caramelo IV etc.)      │ Quilograma (kg)  │ Absorbância, cor, pH         │
│ Dióxido de enxofre              │ Quilograma (kg)  │ Pureza, teor SO₂             │
│ Emulsificante                   │ Quilograma (kg)  │ Pureza, viscosidade          │
│ Antioxidante                    │ Quilograma (kg)  │ Pureza, umidade              │
│ Aromatizante                    │ Litros (L)       │ Intensidade aromática, pH    │
└─────────────────────────────────┴──────────────────┴─────────────────────────────┘

ESPECIFICAÇÕES DE APROVAÇÃO DO INSUMO:
Para cada insumo, cadastrar os parâmetros de aprovação:
- Parâmetro (ex: Pureza, Umidade, pH, Pol, Cor)
- Valor mínimo aceitável
- Valor máximo aceitável
- Unidade (%, g/100g, pH, ICUMSA, etc.)
- Método de análise
- Obrigatório: Sim / Não

CAMPOS DO LOTE DE INSUMO (recebimento):
- Número do lote do fornecedor
- Data de fabricação
- Data de validade
- Quantidade recebida (número + unidade automática do insumo)
- Peso líquido (kg) — para insumos sólidos
- Volume líquido (L) — para insumos líquidos
- Número de embalagens recebidas (sacas, bombonas, cilindros, caixas)
- Peso/volume por embalagem
- Preço unitário (R$ por kg ou por L)
- Valor total do lote (calculado automaticamente)
- Número da nota fiscal + data
- Condição de pagamento
- Upload do certificado de análise do fornecedor (PDF)
- Status: EM ANÁLISE | APROVADO | REPROVADO | QUARENTENA
```

---

## 2. RÓTULO — Checklist Completo (RDC 259/2002 + Decreto 6.871/2009)

### Substituir a seção de Rótulo por esta versão completa:

```
Rota: /embalagens → aba Rótulos

IDENTIFICAÇÃO DO LOTE DE RÓTULO:
- Fornecedor | Lote do fornecedor
- Produto vinculado (qual produto esse rótulo identifica)
- Quantidade recebida (unidades)
- Data de recebimento
- Número da nota fiscal

CHECKLIST DE CONFORMIDADE OBRIGATÓRIA (RDC 259/2002 + Decreto 6.871/2009):
Cada item: CONFORME ✅ | NÃO CONFORME ❌ | NÃO APLICÁVEL

IDENTIFICAÇÃO DO PRODUTO:
[ ] Denominação de venda (nome conforme registro MAPA)
[ ] Número de registro MAPA do produto
[ ] Marca comercial

COMPOSIÇÃO E INGREDIENTES:
[ ] Lista de ingredientes em ordem decrescente de quantidade
[ ] Aditivos com nome e INS (ex: Conservador Benzoato de Sódio INS 211)
[ ] Declaração de alérgenos (contém/não contém: glúten, lactose, etc.)
[ ] Declaração de edulcorantes (se diet/zero): "Contém fenilalanina" (se aspartame)

INFORMAÇÕES DO FABRICANTE:
[ ] Razão social e CNPJ do fabricante
[ ] Endereço completo do estabelecimento (rua, cidade, estado, CEP)
[ ] Número de registro do estabelecimento no MAPA
[ ] "Indústria Brasileira" ou indicação de origem
[ ] SIF/SIE/SIM (se aplicável)

CONTEÚDO E VALIDADE:
[ ] Volume líquido (ex: 2 litros, 350 mL)
[ ] Identificação do lote (campo para impressão do lote variável)
[ ] Data de fabricação (campo variável — impresso na linha)
[ ] Prazo de validade (campo variável OU validade fixa calculada)

INFORMAÇÕES NUTRICIONAIS:
[ ] Tabela nutricional conforme RDC 429/2020 (novo formato)
[ ] Porção e equivalência em colheres/copos
[ ] Valor energético (kcal e kJ)
[ ] Carboidratos | Açúcares totais | Açúcares adicionados
[ ] Proteínas | Gorduras totais | Gorduras saturadas | Gorduras trans
[ ] Fibras alimentares | Sódio
[ ] % VD (Valor Diário)
[ ] Lupa frontal de alerta (se exceder limites de gordura, açúcar ou sódio)

ALERTAS OBRIGATÓRIOS (bebidas):
[ ] "Beba com moderação" (bebidas alcoólicas)
[ ] "Venda proibida para menores de 18 anos" (bebidas alcoólicas)
[ ] "Se beber, não dirija" (bebidas alcoólicas)
[ ] "Este produto não substitui uma alimentação equilibrada" (diet/zero)
[ ] Advertência sobre adoçante (diet/zero com edulcorante)

CÓDIGO DE BARRAS:
[ ] Código de barras legível (EAN-13 ou EAN-8)
[ ] Código correto para o volume e variante do produto

INSPEÇÃO FÍSICA DO RÓTULO:
[ ] Legibilidade de todas as informações
[ ] Cores e impressão conforme arte aprovada
[ ] Dimensões corretas para a embalagem
[ ] Sem rasgos, manchas ou defeitos de impressão

STATUS FINAL DO LOTE DE RÓTULO:
APROVADO | REPROVADO | APROVADO COM RESSALVA

Upload da arte do rótulo aprovada pelo MAPA (PDF ou imagem)
```

---

## 3. LOTE DE PRODUÇÃO — Campos Automáticos Obrigatórios

### Adicionar geração automática ao criar um lote:

```
AO SELECIONAR O PRODUTO, O SISTEMA PREENCHE AUTOMATICAMENTE:

1. NÚMERO DO LOTE (gerado automaticamente):
   Formato: ANO-SEQ-CODPROD-VOL-LINHA
   Exemplo: 2026-0042-REFGUA-2L-L1
   - ANO: ano atual (2026)
   - SEQ: sequencial do ano com 4 dígitos (0042)
   - CODPROD: código do produto (REFGUA = Refrigerante Guaraná)
   - VOL: volume (2L)
   - LINHA: linha de produção (L1)
   OBS: A RDC 259/2002 permite que o fabricante defina o formato,
        mas deve ser único, legível e rastreável.

2. DATA DE FABRICAÇÃO: preenchida automaticamente com data/hora atual
   (editável pelo responsável se necessário)

3. DATA DE VALIDADE: calculada automaticamente
   Data validade = Data fabricação + Validade em dias (do cadastro do produto)
   Exemplo: fabricado em 25/05/2026 + 180 dias = 21/11/2026
   → Exibida no formato DD/MM/AAAA para impressão na embalagem

4. NÚMERO DE REFERÊNCIA DO PRODUTO (para rastreabilidade MAPA):
   Campos automáticos vindos do cadastro do produto:
   - Número de registro MAPA do produto
   - Número de registro MAPA do estabelecimento
   - Código interno do produto
   → Esses três campos aparecem automaticamente no lote e em todos os laudos

5. CAMPOS PARA IMPRESSÃO NA EMBALAGEM (gerados pelo sistema):
   O sistema gera um bloco de dados para o operador configurar a impressora
   de jato de tinta (inkjet) da linha:
   ┌──────────────────────────────────┐
   │ LOTE: 2026-0042-REFGUA-2L-L1    │
   │ FAB: 25/05/2026                  │
   │ VAL: 21/11/2026                  │
   │ REG. MAPA: 123456/2024           │
   └──────────────────────────────────┘
```

---

## 4. SCHEMA PRISMA — Atualizar modelo LoteProducao

```prisma
model LoteProducao {
  id                    String     @id @default(cuid())
  numero                String     @unique  // gerado automaticamente
  produto               Produto    @relation(fields: [produtoId], references: [id])
  produtoId             String
  codigoProduto         String     // vem do produto automaticamente
  registroMAPAProduto   String     // vem do produto automaticamente
  registroMAPAEstab     String     // vem das configurações automaticamente
  dataFabricacao        DateTime   // automática ao criar o lote
  dataValidade          DateTime   // calculada: fabricacao + validade do produto
  dataInicio            DateTime
  dataFim               DateTime?
  volumeProduzido       Float?
  unidadesProduzidas    Int?
  linha                 String
  turno                 String
  responsavel           String
  status                String     @default("EM_PRODUCAO")
  // custos (do complemento anterior)
  custoInsumos          Float?
  custoEmbalagens       Float?
  custoTotal            Float?
  custoPorUnidade       Float?
  custoPorLitro         Float?
  amostras              Amostra[]
  consumos              ConsumoInsumo[]
  createdAt             DateTime   @default(now())
}

model LoteInsumo {
  id                    String    @id @default(cuid())
  insumo                Insumo    @relation(fields: [insumoId], references: [id])
  insumoId              String
  lotesFornecedor       String
  dataFabricacao        DateTime
  dataValidade          DateTime
  quantidade            Float
  unidade               String    // kg | L | unidade | saca | bombona | cilindro
  pesoLiquido           Float?    // kg (para sólidos)
  volumeLiquido         Float?    // L (para líquidos)
  nrEmbalagens          Int?      // número de sacas/bombonas/cilindros
  pesoPorEmbalagem      Float?    // kg ou L por embalagem
  precoUnitario         Float?    // R$ por kg ou L
  valorTotal            Float?    // calculado automaticamente
  numeroNF              String?
  dataNF                DateTime?
  condicaoPagamento     String?
  status                String    @default("EM_ANALISE")
  amostras              Amostra[]
  consumos              ConsumoInsumo[]
  createdAt             DateTime  @default(now())
}

model Rotulo {
  id              String   @id @default(cuid())
  fornecedor      String
  lote            String
  produto         Produto  @relation(fields: [produtoId], references: [id])
  produtoId       String
  quantidade      Int
  dataRecebimento DateTime @default(now())
  numeroNF        String?
  checklist       Json     // todos os itens do checklist armazenados como JSON
  status          String   @default("EM_ANALISE")
  arteUrl         String?  // upload da arte aprovada
  observacoes     String?
  createdAt       DateTime @default(now())
}
```

---

## 5. ROTAS A ADICIONAR/ATUALIZAR

```
/embalagens/rotulos     → Gestão de rótulos com checklist completo
/lotes/novo             → Atualizar com geração automática de número, 
                          data fabricação, data validade e referência MAPA
/relatorios/etiqueta    → Gerar bloco de dados para impressora inkjet da linha
```

---

## 6. ATUALIZAR MANUAL DO USUÁRIO

Adicionar no Capítulo 5 (Embalagens) — seção Rótulo:
- Checklist completo item por item
- Explicação de cada campo obrigatório
- O que acontece se algum item for NÃO CONFORME

Adicionar no Capítulo 6 (Lotes) — campos automáticos:
- Explicar que número do lote, data de fabricação e data de validade
  são gerados automaticamente ao selecionar o produto
- Mostrar o formato do número de lote
- Explicar como imprimir na embalagem (bloco para impressora inkjet)

