# COMPLEMENTO FINAL COMPLETO — LimsQual
## 9 Módulos Faltantes + Padrão de Ações em Todas as Páginas

---

## PARTE 1 — PADRÃO DE AÇÕES EM TODAS AS PÁGINAS

### Barra de ações padrão (obrigatória em TODAS as telas)

Toda página de listagem deve ter no topo:
```
[+ Novo]  [🖨 Imprimir]  [📥 Exportar PDF]  [📊 Exportar Excel]  [🔍 Buscar]  [⚙ Filtros]
```

Toda linha de tabela deve ter coluna de ações:
```
[✏️ Editar]  [👁 Visualizar]  [🖨 Imprimir]  [📋 Duplicar]  [🗑 Excluir]
```

Toda tela de detalhe/formulário deve ter:
```
[💾 Salvar]  [✏️ Editar]  [🖨 Imprimir PDF]  [📧 Enviar por Email]  [↩ Voltar]  [🗑 Excluir]
```

### Regras de permissão por perfil:

| Ação | Admin | RT | Analista | Operador | Cliente |
|------|-------|----|----------|----------|---------|
| Criar | ✅ | ✅ | ✅ | ✅ | ❌ |
| Editar | ✅ | ✅ | ✅* | ❌ | ❌ |
| Excluir | ✅ | ❌ | ❌ | ❌ | ❌ |
| Imprimir PDF | ✅ | ✅ | ✅ | ✅ | ✅** |
| Exportar Excel | ✅ | ✅ | ✅ | ❌ | ❌ |
| Enviar Email | ✅ | ✅ | ✅ | ❌ | ❌ |
| Aprovar/Reprovar | ✅ | ✅ | ❌ | ❌ | ❌ |
| Cancelar NC | ✅ | ✅ | ❌ | ❌ | ❌ |

*Analista só edita registros do próprio turno/dia
**Cliente só imprime laudos da própria empresa

### Regra de exclusão segura:
- Nunca excluir fisicamente — usar soft delete (campo deletedAt)
- Registro excluído some da listagem mas fica no banco
- Admin pode visualizar excluídos em "Lixeira"
- Registros vinculados a laudos emitidos NÃO podem ser excluídos — apenas inativados

### Confirmação antes de excluir:
Modal de confirmação obrigatório:
```
"Tem certeza que deseja excluir [nome do item]?
Esta ação não pode ser desfeita.
[Cancelar]  [Excluir]"
```

### Impressão PDF — padrão em todas as páginas:
- Cabeçalho automático com logo + dados do laboratório
- Data e hora da impressão
- Nome do usuário que imprimiu
- Número da página (X de Y)
- Rodapé com número do documento e QR Code (laudos oficiais)
- Orientação: retrato para formulários, paisagem para relatórios/tabelas

---

## PARTE 2 — MÓDULOS FALTANTES

---

### MÓDULO A — FORMULAÇÃO DO PRODUTO (Receita)

**Rota:** `/produtos/[id]/formulacao`

**O que é:** registro da receita oficial de cada produto, vinculada ao 
registro MAPA. Exigida no processo de registro do produto.

**Campos por ingrediente da formulação:**
```
- Ingrediente (vem do cadastro de insumos)
- Quantidade por 1000 litros de produto (unidade padrão)
- Unidade (kg, L, g, mL)
- % na formulação (calculado automaticamente)
- Faixa permitida (mín % — máx %) — conforme legislação
- Função tecnológica (acidulante, conservante, corante, edulcorante, etc.)
- INS (número do aditivo, se aplicável)
- Legislação que permite o uso (IN MAPA, RDC ANVISA)
- Obrigatório / Opcional
```

**Ações disponíveis:**
- ✏️ Editar formulação
- 💾 Salvar nova versão (com controle de versões)
- 🖨 Imprimir PDF da formulação
- 📋 Duplicar para outro produto
- 🔒 Bloquear (formulação aprovada não pode ser editada sem justificativa)

**Regra:** Ao alterar formulação, cria nova versão com data e responsável.
Versão anterior fica arquivada. Laudo sempre referencia a versão vigente.

---

### MÓDULO B — ANÁLISE SENSORIAL FORMAL

**Rota:** `/sensorial`

**O que é:** painel de degustação por lote com registro formal.
Obrigatório pelo Decreto 6.871/2009 para liberação de produto acabado.

**Cadastro do painel:**
```
- Lote avaliado
- Data e hora da avaliação
- Avaliadores (lista de degustadores cadastrados)
- Produto de referência (padrão aprovado para comparação)
```

**Ficha de avaliação por degustador (escala hedônica 1-9):**
```
PARÂMETRO         | ESCALA           | NOTA | OBSERVAÇÃO
Aparência         | 1=Desgostei muito| ____ | __________
Cor               | 5=Indiferente    | ____ | __________
Odor/Aroma        | 9=Gostei muito   | ____ | __________
Sabor             | ——               | ____ | __________
Carbonatação      | ——               | ____ | __________
Corpo/Textura     | ——               | ____ | __________
Impressão global  | ——               | ____ | __________

Desvios percebidos (campo livre):
Comparação com padrão: IGUAL / SUPERIOR / INFERIOR
Parecer: APROVADO / REPROVADO / APROVADO COM RESSALVA
```

**Resultado consolidado automático:**
- Média de cada parâmetro
- Desvio padrão entre avaliadores
- Resultado final (maioria simples)
- Se REPROVADO → abre NC automaticamente

**Ações:**
- ✏️ Editar avaliação (apenas do próprio avaliador, antes de finalizar)
- 💾 Finalizar avaliação (bloqueio após finalizar)
- 🖨 Imprimir ficha de avaliação PDF
- 📊 Exportar resultado consolidado

---

### MÓDULO C — CONTROLE DE ÁGUA DE PROCESSO

**Rota:** `/agua-processo`

**Base legal:** Portaria GM/MS 888/2021 — exige análise periódica
da água utilizada na fabricação.

**Frequências obrigatórias:**
```
GRUPO 1 — Análise microbiológica mínima:
- Coliformes totais e E. coli: MENSAL (poço/manancial) ou TRIMESTRAL (rede pública)
- Cloro residual livre: DIÁRIO (registro no sistema)

GRUPO 2 — Análise físico-química básica:
- pH, turbidez, cor aparente, condutividade: MENSAL

GRUPO 3 — Análise completa (portaria 888):
- 40+ parâmetros: SEMESTRAL (poço artesiano) ou ANUAL (rede pública)
```

**Parâmetros obrigatórios por grupo:**
```
DIÁRIOS (registro operacional):
- Cloro residual livre (mín 0,2 mg/L — máx 2,0 mg/L)
- pH (6,0 — 9,5)
- Turbidez (máx 1,0 UT)
- Temperatura (°C)
- Ponto de coleta + responsável

MENSAIS:
- Coliformes totais (ausência em 100mL)
- E. coli (ausência em 100mL)
- Cor aparente (máx 15 uH)
- Condutividade (µS/cm)
- Nitrato (máx 10 mg/L)
- Dureza total (mg/L CaCO₃)
- Alcalinidade total
- Ferro total (máx 0,3 mg/L)
- Manganês (máx 0,1 mg/L)
- Cloro residual livre
- pH
- Turbidez

SEMESTRAIS/ANUAIS (laudo laboratorial externo obrigatório):
- Todos os parâmetros da Portaria 888/2021
- Upload do laudo do laboratório credenciado (PDF)
- Número do laudo externo
```

**Dashboard da água:**
- Status atual: APROVADA ✅ / ATENÇÃO ⚠️ / REPROVADA ❌
- Última análise de cada grupo
- Próxima análise programada
- Alerta quando análise estiver vencida

**Ações:**
- ✏️ Lançar resultado diário
- 💾 Salvar
- 🖨 Imprimir histórico de controle de água (PDF)
- 📊 Exportar planilha mensal
- 📧 Enviar laudo de potabilidade ao cliente (quando solicitado)

---

### MÓDULO D — CONTROLE DE TEMPERATURA

**Rota:** `/temperatura`

**O que é:** monitoramento diário das câmaras frias, armazéns e 
áreas de produção. Exigência da Portaria MAPA 1343/2025.

**Cadastro de pontos de monitoramento:**
```
- Nome do ponto (ex: Câmara fria 1, Armazém de insumos, Sala de produção)
- Tipo: Câmara fria | Armazém | Área de produção | Câmara de retenção
- Temperatura mínima permitida (°C)
- Temperatura máxima permitida (°C)
- Frequência de registro (a cada hora, 2x ao dia, etc.)
- Responsável pelo monitoramento
- Equipamento (termômetro — vem do cadastro de equipamentos)
```

**Registro diário:**
```
- Ponto de monitoramento
- Data e hora
- Temperatura registrada (°C)
- Nome do responsável
- Observações
- Status automático: NORMAL ✅ / DESVIO ❌

Se DESVIO → abre NC automaticamente + alerta ao supervisor
```

**Relatório mensal de temperatura:**
- Tabela com todos os registros do mês
- Gráfico de linha mostrando variação
- % de registros dentro do limite
- NCs geradas por desvio de temperatura

**Ações:**
- ✏️ Lançar leitura
- 💾 Salvar
- 🖨 Imprimir relatório mensal PDF
- 📊 Exportar Excel do histórico

---

### MÓDULO E — CONTROLE DE ESTOQUE E EXPEDIÇÃO

**Rota:** `/estoque`

**O que é:** controle de quantidade em estoque de produto acabado
e movimentações por cliente. Necessário para rastreabilidade e
Declaração Anual ao MAPA.

**Cadastro de movimentação:**
```
ENTRADA (lote aprovado):
- Lote | Produto | Data de fabricação | Data de validade
- Quantidade (caixas/unidades/litros)
- Localização no armazém (prateleira, posição)
- Status: LIBERADO | RETIDO | QUARENTENA

SAÍDA (expedição):
- Lote expedido
- Data de saída
- Cliente destinatário (CNPJ + razão social)
- Nota fiscal de saída (número + upload PDF)
- Quantidade expedida (caixas/unidades/litros)
- Transportadora + placa do veículo
- Temperatura de saída (°C) — para produtos com cadeia de frio
- Responsável pela expedição
```

**Saldo automático:**
- Saldo atual por produto = entradas - saídas
- Alerta quando estoque abaixo do mínimo
- Alerta quando produto próximo ao vencimento (30 dias antes)
- Lotes vencidos em estoque — alerta crítico

**Rastreabilidade de distribuição:**
- Para cada lote: lista de todos os clientes que receberam
- Para cada cliente: lista de todos os lotes recebidos
- Base para recall — sabe exatamente onde cada lote está

**Relatório para Declaração Anual MAPA:**
- Consolidado automático de produção e expedição por produto
- Estoque em 31/dezembro
- Exporta no formato da DAP (Declaração Anual de Produção)

**Ações:**
- ✏️ Editar movimentação (apenas Admin)
- 💾 Salvar entrada/saída
- 🖨 Imprimir romaneio de expedição PDF
- 📊 Exportar relatório de estoque Excel
- 📧 Enviar romaneio ao cliente por email

---

### MÓDULO F — RECALL / RECOLHIMENTO DE PRODUTO

**Rota:** `/recall`

**Base legal:** Decreto 6.871/2009 Art. 80 e Lei 8.918/1994.
Obrigatório comunicar ao MAPA em caso de produto impróprio no mercado.

**Abertura de recall:**
```
- Número do recall (gerado automaticamente: RC-2026-001)
- Lote(s) afetado(s) — seleção múltipla
- Motivo: Contaminação microbiológica | NC físico-química | 
          Corpo estranho | Rotulagem incorreta | Outro
- Descrição detalhada do problema
- Data de identificação do problema
- Origem da identificação: 
  Análise interna | Reclamação cliente | Fiscalização MAPA/ANVISA | Outro
- Responsável pelo recall
- Nível do recall:
  Classe I — risco grave à saúde (recolhimento imediato)
  Classe II — risco moderado
  Classe III — sem risco imediato (rotulagem)
```

**Rastreabilidade automática do recall:**
O sistema usa o módulo de estoque para mostrar automaticamente:
- Quantidade total produzida do lote
- Quantidade ainda em estoque próprio
- Quantidade já expedida (com lista de clientes e NFs)
- Quantidade estimada no mercado

**Ações do recall:**
```
COMUNICAÇÃO:
- Gerar comunicado oficial ao MAPA (PDF no formato exigido)
- Gerar comunicado aos clientes (email automático para todos que receberam o lote)
- Registrar data do comunicado ao MAPA
- Registrar protocolo de atendimento do MAPA

CONTROLE DE RETORNO:
- Registrar quantidade retornada por cliente
- Status por cliente: NOTIFICADO | RETORNOU | DESCARTOU | NÃO LOCALIZADO
- % de retorno do mercado

ENCERRAMENTO:
- Data de encerramento
- Quantidade total recolhida
- Destinação: Descarte | Reprocesso
- Relatório final para o MAPA
```

**Ações:**
- ✏️ Editar recall (apenas RT e Admin)
- 💾 Salvar
- 🖨 Imprimir comunicado oficial MAPA PDF
- 📧 Enviar notificação automática para todos os clientes afetados
- 📊 Exportar relatório de rastreabilidade do recall

---

### MÓDULO G — SAC / RECLAMAÇÃO DE CLIENTE

**Rota:** `/sac`

**O que é:** sistema estruturado de atendimento a reclamações de
clientes com prazo de resposta e investigação formal.

**Abertura de reclamação:**
```
- Número SAC (gerado automaticamente: SAC-2026-001)
- Cliente (CNPJ + razão social)
- Data do contato
- Canal: Email | Telefone | WhatsApp | Presencial | Portal
- Produto reclamado | Lote (se informado)
- Tipo de reclamação:
  Qualidade do produto (sabor, cor, odor, carbonatação)
  Corpo estranho
  Embalagem danificada
  Prazo de validade
  Rotulagem incorreta
  Atraso na entrega
  Documentação (laudo, NF)
  Outro
- Descrição detalhada
- Foto/evidência (upload de imagem ou PDF)
- Urgência: Baixa | Média | Alta | Crítica
```

**Fluxo de atendimento:**
```
ABERTA → EM INVESTIGAÇÃO → AGUARDANDO RETORNO → ENCERRADA
```

**Prazo de resposta automático:**
- Crítica: 24 horas
- Alta: 48 horas
- Média: 5 dias úteis
- Baixa: 10 dias úteis
- Alerta automático quando prazo estiver vencendo

**Investigação:**
- OS de análise vinculada (se for problema de qualidade)
- Análise de contraprova do lote reclamado
- Causa raiz identificada
- Ação corretiva tomada

**Resposta ao cliente:**
- Carta resposta gerada automaticamente (editável)
- Registrar data de envio da resposta
- Status do cliente: Satisfeito | Insatisfeito | Sem retorno

**Ações:**
- ✏️ Editar reclamação
- 💾 Salvar
- 🖨 Imprimir ficha de reclamação PDF
- 📧 Enviar resposta ao cliente por email
- 🔗 Vincular a NC ou recall relacionado

---

### MÓDULO H — GESTÃO DE FUNCIONÁRIOS / COLABORADORES

**Rota:** `/colaboradores`

**O que é:** cadastro completo de colaboradores com controle de
treinamentos, exames e acesso ao sistema.

**Cadastro do colaborador:**
```
DADOS PESSOAIS:
- Nome completo | CPF | Data de nascimento
- Cargo | Setor | Data de admissão
- Email | Telefone

ACESSO AO SISTEMA:
- Perfil: Admin | RT | Analista | Operador | Visualizador
- Login (email) + senha provisória (enviada por email)
- Ativo / Inativo

SAÚDE OCUPACIONAL (exigência MAPA BPF):
- Data do último exame admissional/periódico
- Próximo exame programado
- Alerta quando exame vencer
- Aptidão: APTO | APTO COM RESTRIÇÕES | INAPTO

TREINAMENTOS (vinculado ao módulo de Documentos):
- Matriz de treinamento automática
- Verde = treinado e vigente
- Amarelo = vencendo em 30 dias
- Vermelho = vencido ou não treinado

HABILIDADES / HABILITAÇÕES:
- Equipamentos que está habilitado a operar/analisar
- Ex: "Habilitado para pHmetro, refratômetro, carbonatômetro"
- Analista só pode selecionar equipamentos para os quais está habilitado
```

**Cartão de identificação digital:**
- Gera crachá PDF com foto, nome, cargo, setor e QR Code
- QR Code leva ao registro do colaborador no sistema

**Ações:**
- ✏️ Editar colaborador
- 💾 Salvar
- 🖨 Imprimir crachá PDF
- 🖨 Imprimir ficha do colaborador
- 📧 Enviar credenciais de acesso por email
- 🔒 Inativar acesso (desligamento)
- 📊 Exportar lista de colaboradores Excel

---

### MÓDULO I — GESTÃO DE CLIENTES (EXPANDIDO)

**Rota:** `/clientes` — expandir o módulo existente

**Adicionar aos campos já existentes:**
```
DADOS COMERCIAIS:
- Tipo: Distribuidor | Atacadista | Varejista | Consumidor final | Exportação
- Limite de crédito (R$)
- Condição de pagamento padrão
- Vendedor responsável

CONTATOS MÚLTIPLOS:
- Contato comercial (nome + email + telefone)
- Contato de qualidade/RT (nome + email + telefone)  ← IMPORTANTE
- Contato financeiro (nome + email + telefone)
- Contato para recebimento de laudos (email automático)

HISTÓRICO COMPLETO:
- Todos os lotes recebidos (com datas e NFs)
- Todas as reclamações SAC
- Todos os laudos emitidos
- % de aprovação dos produtos entregues
- Valor total comprado no período

DOCUMENTOS DO CLIENTE:
- Upload: Alvará de funcionamento
- Upload: Licença Vigilância Sanitária
- Upload: Contrato comercial
- Validades com alerta automático

ACESSO AO PORTAL:
- Criar/revogar acesso ao portal do cliente
- Histórico de acessos ao portal
```

**Ações:**
- ✏️ Editar cliente
- 💾 Salvar
- 🖨 Imprimir ficha do cliente PDF
- 📧 Enviar laudo mais recente por email
- 🔑 Criar/revogar acesso ao portal
- 📊 Exportar histórico do cliente Excel
- 🚫 Inativar cliente

---

## PARTE 3 — SCHEMA PRISMA — NOVOS MODELOS

```prisma
model Formulacao {
  id          String   @id @default(cuid())
  produto     Produto  @relation(fields: [produtoId], references: [id])
  produtoId   String
  versao      Int      @default(1)
  vigente     Boolean  @default(true)
  aprovadaPor String
  dataAprovacao DateTime
  ingredientes FormulacaoIngrediente[]
  createdAt   DateTime @default(now())
}

model FormulacaoIngrediente {
  id              String      @id @default(cuid())
  formulacao      Formulacao  @relation(fields: [formulacaoId], references: [id])
  formulacaoId    String
  insumoId        String
  quantidade      Float
  unidade         String
  percentual      Float
  minimoPerc      Float?
  maximoPerc      Float?
  funcao          String
  ins             String?
  legislacao      String?
  obrigatorio     Boolean     @default(true)
}

model AvaliacaoSensorial {
  id          String   @id @default(cuid())
  loteId      String
  data        DateTime
  resultado   String
  itens       AvaliacaoSensorialItem[]
  createdAt   DateTime @default(now())
}

model AvaliacaoSensorialItem {
  id            String             @id @default(cuid())
  avaliacao     AvaliacaoSensorial @relation(fields: [avaliacaoId], references: [id])
  avaliacaoId   String
  avaliador     String
  aparencia     Int
  cor           Int
  odor          Int
  sabor         Int
  carbonatacao  Int
  impressaoGlobal Int
  parecer       String
  desvios       String?
}

model ControlAgua {
  id          String   @id @default(cuid())
  ponto       String
  tipo        String   // DIARIO | MENSAL | SEMESTRAL
  data        DateTime
  parametros  Json
  responsavel String
  status      String
  createdAt   DateTime @default(now())
}

model RegistroTemperatura {
  id          String   @id @default(cuid())
  ponto       String
  temperatura Float
  minimo      Float
  maximo      Float
  conforme    Boolean
  responsavel String
  data        DateTime @default(now())
}

model MovimentacaoEstoque {
  id              String   @id @default(cuid())
  tipo            String   // ENTRADA | SAIDA
  loteId          String
  quantidade      Float
  unidade         String
  clienteId       String?
  notaFiscal      String?
  notaFiscalUrl   String?
  transportadora  String?
  placaVeiculo    String?
  temperatura     Float?
  responsavel     String
  data            DateTime @default(now())
}

model Recall {
  id              String   @id @default(cuid())
  numero          String   @unique
  lotes           String[]
  motivo          String
  descricao       String
  nivel           String
  status          String   @default("ABERTO")
  responsavel     String
  dataIdentificao DateTime
  dataMAPA        DateTime?
  protocoloMAPA   String?
  retornos        RecallRetorno[]
  createdAt       DateTime @default(now())
}

model RecallRetorno {
  id          String   @id @default(cuid())
  recall      Recall   @relation(fields: [recallId], references: [id])
  recallId    String
  clienteId   String
  qtdNotific  Float
  qtdRetorno  Float?
  status      String   @default("NOTIFICADO")
  data        DateTime @default(now())
}

model SAC {
  id          String   @id @default(cuid())
  numero      String   @unique
  clienteId   String
  produto     String?
  lote        String?
  tipo        String
  descricao   String
  urgencia    String   @default("MEDIA")
  status      String   @default("ABERTA")
  prazo       DateTime
  causaRaiz   String?
  acao        String?
  resposta    String?
  dataResposta DateTime?
  evidencias  String[]
  createdAt   DateTime @default(now())
}

model Colaborador {
  id              String   @id @default(cuid())
  nome            String
  cpf             String   @unique
  cargo           String
  setor           String
  email           String   @unique
  telefone        String?
  dataAdmissao    DateTime
  role            String   @default("ANALISTA")
  ativo           Boolean  @default(true)
  proximoExame    DateTime?
  aptidao         String   @default("APTO")
  equipamentos    String[]
  createdAt       DateTime @default(now())
}
```

---

## PARTE 4 — ROTAS A ADICIONAR

```
/produtos/[id]/formulacao   → Formulação/receita do produto
/sensorial                  → Análise sensorial formal
/agua-processo              → Controle de água de processo
/temperatura                → Monitoramento de temperatura
/estoque                    → Controle de estoque e expedição
/recall                     → Gestão de recall/recolhimento
/sac                        → SAC / Reclamações de clientes
/colaboradores              → Gestão de colaboradores
```

---

## PARTE 5 — ADICIONAR NO MENU LATERAL

```
Seção "Produção e Qualidade":
- Lotes (já existe)
- Formulação (nova)
- Estoque e Expedição (nova)
- Temperatura (nova)

Seção "Análises":
- Amostras/OS (já existe)
- Sensorial (nova)
- Água de Processo (nova)

Seção "Gestão":
- Não Conformidades (já existe)
- SAC / Reclamações (nova)
- Recall (nova)

Seção "Pessoas":
- Colaboradores (nova)
- Clientes (expandido)
- Fornecedores (já existe)

Seção "Conformidade":
- Auditoria (já existe)
- APPCC (já existe)
- BPF (já existe)
- Documentos (já existe)
- Registro MAPA (já existe)
```

