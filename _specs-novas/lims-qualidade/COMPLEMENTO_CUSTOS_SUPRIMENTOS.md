# COMPLEMENTO — Controle de Custos de Suprimentos e Insumos

## ADICIONAR ao módulo de Insumos e Embalagens

### Campos de custo a adicionar em cada Lote de Insumo:

```
- Preço unitário (R$) — preço por unidade de medida (kg, L, unidade)
- Unidade de medida — kg | L | g | mL | unidade | caixa | fardo
- Quantidade recebida — quantidade total do lote
- Valor total do lote (R$) — calculado automaticamente (preço × quantidade)
- Número da nota fiscal — NF do fornecedor
- Data da nota fiscal
- Condição de pagamento — À vista | 30 dias | 60 dias | 90 dias
```

### Campos de custo a adicionar em Embalagens:

```
- Preço unitário (R$) — por unidade (garrafa, tampa, rótulo)
- Quantidade recebida
- Valor total do lote (R$) — calculado automaticamente
- Número da nota fiscal
```

### Custo por Lote de Produção (calculado automaticamente):

Quando a empresa registrar o consumo de insumos num lote de produção,
o sistema calcula automaticamente:

```
Custo total de insumos do lote = Σ (quantidade usada × preço unitário) 
                                   para cada insumo consumido

Custo de embalagens do lote   = Σ (quantidade usada × preço unitário)
                                   para cada embalagem usada

Custo total do lote (R$)      = custo insumos + custo embalagens

Custo por unidade produzida   = custo total ÷ unidades produzidas
Custo por litro               = custo total ÷ volume em litros
```

### Nova seção no Dashboard — Painel Financeiro:

```
Cards financeiros:
- Custo médio por lote (últimos 30 dias)
- Custo por litro produzido (por produto)
- Total gasto em insumos no mês
- Total gasto em embalagens no mês

Gráficos:
- Custo por insumo (pizza) — qual insumo mais onera a produção
- Evolução do custo por lote ao longo do tempo (linha)
- Comparativo de custo entre produtos
```

### Relatório de Custos:

```
/relatorios/custos → Relatório financeiro de produção

Filtros: período, produto, linha de produção

Colunas do relatório:
- Lote | Produto | Data | Unidades | Custo insumos | Custo embalagens | Custo total | Custo/unidade | Custo/litro
```

---

## ATUALIZAR O SCHEMA PRISMA

Adicionar campos de custo nos modelos existentes:

```prisma
model LoteInsumo {
  // campos já existentes...
  precoUnitario    Float?
  quantidade       Float?
  unidade          String?
  valorTotal       Float?   // calculado: precoUnitario × quantidade
  numeroNF         String?
  dataNF           DateTime?
  condicaoPagamento String?
}

model Embalagem {
  // campos já existentes...
  precoUnitario    Float?
  quantidadeRecebida Float?
  valorTotal       Float?
  numeroNF         String?
}

model ConsumoInsumo {
  // campos já existentes...
  custoUnitario    Float?   // vem do precoUnitario do LoteInsumo
  custoTotal       Float?   // calculado: quantidade × custoUnitario
}

model LoteProducao {
  // campos já existentes...
  custoInsumos     Float?   // calculado automaticamente
  custoEmbalagens  Float?   // calculado automaticamente
  custoTotal       Float?   // calculado automaticamente
  custoPorUnidade  Float?   // calculado: custoTotal ÷ unidadesProduzidas
  custoPorLitro    Float?   // calculado: custoTotal ÷ volumeProduzido
}
```

---

## ROTA A ADICIONAR:

```
/relatorios/custos → Relatório financeiro de suprimentos e produção
```

## ADICIONAR NO MENU:
- /relatorios/custos → ícone de moeda (ti-coin)
  dentro de Relatórios no menu lateral

