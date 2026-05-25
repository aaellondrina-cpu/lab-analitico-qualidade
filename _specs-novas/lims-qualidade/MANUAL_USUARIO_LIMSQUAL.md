# MANUAL DO USUÁRIO — LimsQual
## Sistema de Gestão de Qualidade para Indústria de Bebidas e Refrigerantes
### Versão 1.0 — 2026

---

# ÍNDICE

1. Primeiros passos — configuração inicial
2. Cadastro de produtos
3. Cadastro de fornecedores
4. Cadastro de insumos e lotes de insumos
5. Cadastro de embalagens
6. Registro de lotes de produção
7. Abertura de Ordem de Serviço (OS)
8. Lançamento de resultados
9. Gestão de não conformidades
10. Emissão de laudos
11. Controle de equipamentos
12. Registros de BPF e CIP
13. APPCC — Pontos Críticos de Controle
14. Auditoria interna e externa
15. Declaração Anual de Produção (MAPA)
16. Relatórios e rastreabilidade
17. Portal do cliente
18. Configurações do laboratório

---

# CAPÍTULO 1 — PRIMEIROS PASSOS

## Antes de começar, faça isso primeiro!

Antes de registrar qualquer lote ou amostra, você precisa configurar o sistema. Siga esta ordem obrigatória:

```
PASSO 1 → Configurações do laboratório (dados, logo, RT, autorizações)
PASSO 2 → Cadastrar produtos
PASSO 3 → Cadastrar fornecedores
PASSO 4 → Cadastrar insumos
PASSO 5 → Cadastrar embalagens
PASSO 6 → Cadastrar equipamentos do laboratório
PASSO 7 → Cadastrar pontos de coleta
PASSO 8 → Cadastrar colaboradores
PASSO 9 → Pronto! Agora pode registrar lotes e análises
```

## Como fazer login

1. Acesse o endereço do sistema no navegador
2. Digite seu **email** e **senha**
3. Clique em **Entrar**
4. Na primeira vez, troque sua senha em Configurações → Minha conta

---

# CAPÍTULO 2 — CADASTRO DE PRODUTOS

**Onde:** Menu lateral → **Produtos** → botão **Novo produto**

## Passo a passo

**Passo 1 — Informações básicas**
- Digite o **nome** do produto (ex: Refrigerante Guaraná 2L)
- Digite o **código interno** (ex: REF-GUA-2L)
- Selecione o **sabor** (guaraná, cola, laranja, limão, uva...)
- Selecione o **volume** (200ml, 350ml, 600ml, 1L, 1,5L, 2L, 3L)
- Selecione o **tipo de embalagem** (PET, Vidro retornável, Vidro não retornável, Lata)
- Selecione a **versão** (Regular, Diet, Light, Zero açúcar, Zero sódio)
- Digite a **validade em dias** (ex: 180)

**Passo 2 — Registro MAPA**
- Digite o **número de registro do produto no MAPA**
- Digite a **data de concessão** do registro
- Faça o **upload do certificado de registro** (PDF)
- ⚠️ O sistema alerta automaticamente 60 dias antes do vencimento

**Passo 3 — Especificações técnicas (limites de aprovação)**

Para cada parâmetro, defina o valor mínimo e máximo aceitável:

| Parâmetro | Exemplo mín | Exemplo máx | Unidade |
|-----------|-------------|-------------|---------|
| pH | 2,8 | 3,4 | — |
| °Brix | 10,0 | 12,0 | °Brix |
| CO₂ | 3,0 | 4,0 | volumes |
| Acidez titulável | 0,10 | 0,30 | g/100mL |
| Turbidez | 0 | 5,0 | NTU |
| Coliformes totais | — | ausência | NMP/mL |
| Bolores e Leveduras | — | 10 | UFC/mL |

> ⚠️ **Importante:** Esses limites são usados pelo sistema para julgar automaticamente cada resultado. Se o resultado estiver fora dos limites, o sistema abre uma Não Conformidade automaticamente.

**Passo 4 — Rotulagem MAPA**
- Verifique todos os itens do checklist de rotulagem
- Faça upload da arte do rótulo aprovada pelo MAPA
- Marque o status como **APROVADA**

**Passo 5 — Salvar**
- Clique em **Salvar produto**

---

# CAPÍTULO 3 — CADASTRO DE FORNECEDORES

**Onde:** Menu lateral → **Fornecedores** → botão **Novo fornecedor**

## Passo a passo

**Passo 1 — Dados do fornecedor**
- Razão social
- CNPJ
- Nome do responsável técnico
- Email | Telefone | Endereço completo

**Passo 2 — Certificações**
- Marque as certificações do fornecedor (ISO 9001, FSSC 22000, BPF, outros)

**Passo 3 — Vincular insumos**
- Selecione quais insumos esse fornecedor entrega

**Passo 4 — Salvar**

> 💡 **Dica:** O sistema calcula automaticamente o percentual de aprovação de cada fornecedor com base no histórico de lotes. Fornecedores com baixo percentual de aprovação aparecem em destaque no dashboard.

---

# CAPÍTULO 4 — CADASTRO DE INSUMOS E LOTES

## 4.1 Cadastrar o insumo (fazer uma vez só)

**Onde:** Menu lateral → **Insumos** → botão **Novo insumo**

- Nome do insumo (ex: Açúcar cristal, CO₂ grau alimentício, Ácido cítrico)
- Código interno
- Tipo (Água, Açúcar, CO₂, Concentrado, Edulcorante, Acidulante, Conservante, Corante)
- Fornecedor principal
- Unidade de medida (kg, L, g, mL, unidade)

## 4.2 Registrar lote de insumo (a cada recebimento)

**Onde:** Menu lateral → **Insumos** → clique no insumo → **Novo lote**

**Passo 1 — Identificação do lote**
- Número do lote do fornecedor
- Data de fabricação
- Data de validade
- ⚠️ O sistema alerta quando a validade estiver vencendo em 30 dias

**Passo 2 — Quantidade e custo**
- Quantidade recebida
- Unidade de medida
- Preço unitário (R$)
- Valor total do lote (calculado automaticamente)
- Número da nota fiscal e data
- Condição de pagamento (à vista, 30, 60 ou 90 dias)

**Passo 3 — Certificado de análise**
- Faça o upload do certificado de análise do fornecedor (PDF)

**Passo 4 — Status inicial**
- O status começa automaticamente como **EM ANÁLISE**
- Após análise laboratorial: mude para **APROVADO** ou **REPROVADO**
- Em caso de dúvida: **QUARENTENA**

> ⚠️ **Importante:** Insumo em quarentena ou reprovado aparece em alerta no dashboard e não pode ser vinculado a lotes de produção.

---

# CAPÍTULO 5 — CADASTRO DE EMBALAGENS

**Onde:** Menu lateral → **Embalagens** → botão **Nova embalagem**

## Garrafa PET

- Fornecedor | Lote | Volume nominal
- Peso da garrafa (g)
- Espessura da parede (mm)
- Resistência à pressão interna (bar)
- Torque de abertura da tampa (N.cm)
- Resultado da inspeção visual (trincas, deformações, contaminações)
- Status: APROVADA | REPROVADA

## Vidro Retornável

- Lote de retorno
- Número de trips (quantas vezes foi usada)
- Resultado da inspeção visual (trincas, lascas, sujidade, odor)
- Resultado microbiológico pós-lavagem
- Status: APROVADA | REJEITADA | DESCARTE

## Tampa e Rótulo

- Fornecedor | Lote
- Resultado da inspeção visual
- Status

> 💡 **Dica:** Embalagens reprovadas não podem ser vinculadas a lotes de produção.

---

# CAPÍTULO 6 — REGISTRO DE LOTES DE PRODUÇÃO

**Onde:** Menu lateral → **Lotes** → botão **Novo lote**

> Este é o módulo mais importante do sistema. Tudo começa aqui.

## Passo a passo

**Passo 1 — Identificação do lote**
- O número do lote é gerado automaticamente (LOTE-2026-0001)
- Selecione o **produto** que será fabricado
- Digite a **data e hora de início** da produção
- Selecione a **linha de produção** (Linha 1, Linha 2...)
- Selecione o **turno** (Manhã, Tarde, Noite)
- Digite o nome do **responsável de produção**

**Passo 2 — Insumos utilizados (rastreabilidade)**
- Para cada insumo usado neste lote, clique em **Adicionar insumo**
- Selecione o **insumo** e o **lote do insumo** (com número de lote do fornecedor)
- Digite a **quantidade utilizada**
- Repita para todos os insumos: água, açúcar, CO₂, concentrado, acidulante, conservante, corante, edulcorante

**Passo 3 — Embalagens utilizadas**
- Selecione o lote de garrafa PET ou vidro utilizado
- Selecione o lote de tampas
- Selecione o lote de rótulos

**Passo 4 — Registros de elaboração (BPF — MAPA)**
- Xarope simples: hora de início, quantidade, responsável
- Xarope composto: hora de início, ingredientes adicionados, responsável
- Carbonatação: hora, volumes de CO₂, pressão
- Envase: hora de início, hora de término, velocidade da linha

**Passo 5 — Resultado final**
- Ao finalizar a produção, registre:
  * Volume total produzido (litros)
  * Unidades produzidas (caixas ou unidades)
  * Data e hora de término

**Passo 6 — Aguardar análise**
- O status muda para **AGUARDANDO ANÁLISE**
- Abra as Ordens de Serviço necessárias (próximo capítulo)

## Status do lote

| Status | Significado |
|--------|-------------|
| EM PRODUÇÃO | Lote sendo fabricado |
| AGUARDANDO ANÁLISE | Produção concluída, aguardando resultados |
| APROVADO | Todos os resultados conformes — pode expedir |
| REPROVADO | Resultado fora do limite — lote retido |
| REPROCESSO | Em processo de correção |
| EXPEDIDO | Lote liberado e enviado |

---

# CAPÍTULO 7 — ABERTURA DE ORDEM DE SERVIÇO (OS)

**Onde:** Menu lateral → **Amostras** → botão **Nova OS**

> A OS é o registro de cada análise solicitada. O sistema gera o número automaticamente (OS-2026-0001).

## Passo a passo

**Passo 1 — Tipo de amostra**
Selecione o que está sendo analisado:
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

**Passo 2 — Vinculação**
- Selecione o **lote de produção** vinculado (se for produto acabado)
- Ou o **lote de insumo** (se for matéria prima)

**Passo 3 — Coleta**
- Ponto de coleta (ex: Linha 1 — pós-enchedora, Tanque de xarope)
- Nome do responsável pela coleta
- Data e hora da coleta
- Condições de transporte (temperatura, integridade da embalagem)

**Passo 4 — Prazo e analista**
- Data e hora de recebimento no laboratório
- Prazo de entrega do laudo
- Analista responsável pela análise

**Passo 5 — Contraprova (MAPA)**
- Quantidade de amostra retida para contraprova
- Local de armazenamento
- Prazo de descarte

**Passo 6 — Salvar**
- A OS é criada com status **RECEBIDA**

## Fluxo da OS

```
RECEBIDA → EM ANÁLISE → AGUARDANDO APROVAÇÃO → APROVADO → LAUDO EMITIDO
```

---

# CAPÍTULO 8 — LANÇAMENTO DE RESULTADOS

**Onde:** Menu → **Amostras** → clique na OS → botão **Lançar resultados**

## Passo a passo

**Passo 1 — Selecionar parâmetro**
- Clique em **Adicionar resultado**
- Selecione o parâmetro (pH, Brix, CO₂, Coliformes, etc.)

**Passo 2 — Preencher o resultado**
- Digite o **valor obtido** (ex: 3,2)
- Confirme a **unidade** (já vem preenchida do cadastro)
- Selecione o **método analítico** utilizado
- Selecione o **equipamento** usado (deve estar calibrado)
- Data e hora do ensaio
- Nome do analista

**Passo 3 — Conformidade automática**
O sistema compara com os limites cadastrados no produto e indica:
- ✅ **CONFORME** — resultado dentro dos limites (verde)
- ⚠️ **ATENÇÃO** — resultado dentro dos limites mas a menos de 10% do limite (amarelo)
- ❌ **NÃO CONFORME** — resultado fora dos limites (vermelho)

> ⚠️ **Se o resultado for NÃO CONFORME:** o sistema abre uma Não Conformidade automaticamente e notifica o responsável técnico. O lote vinculado é colocado em retenção automática.

**Passo 4 — Salvar e continuar**
- Salve cada resultado e continue adicionando os demais parâmetros

**Passo 5 — Encaminhar para aprovação**
- Após lançar todos os resultados, clique em **Encaminhar para aprovação**
- O status muda para **AGUARDANDO APROVAÇÃO**
- O responsável técnico recebe notificação para revisar

**Passo 6 — Aprovação pelo RT**
- O Responsável Técnico acessa a OS
- Revisa todos os resultados
- Clica em **Aprovar e emitir laudo** ou **Reprovar**

---

# CAPÍTULO 9 — GESTÃO DE NÃO CONFORMIDADES

**Onde:** Menu lateral → **Não conformidades**

> As NCs são abertas automaticamente quando um resultado sai fora do limite. Mas também podem ser abertas manualmente.

## Passo a passo — tratar uma NC

**Passo 1 — Acessar a NC**
- No dashboard, clique no alerta de NC ou vá em **Não conformidades**
- Clique na NC para abrir

**Passo 2 — Disposição imediata (obrigatório)**
Defina o que fazer com o lote/insumo:

| Opção | Quando usar |
|-------|-------------|
| **Liberar** | Resultado levemente fora — justificativa técnica obrigatória |
| **Reter lote** | Aguardando reanálise ou decisão |
| **Reprocessar** | Produto pode ser corrigido |
| **Descarte** | Produto impróprio — autorização gerencial obrigatória |

**Passo 3 — Análise de causa raiz**
- Descreva a causa do desvio (5 Porquês ou Ishikawa)
- Selecione a categoria da causa (matéria prima, equipamento, processo, humana, ambiental)

**Passo 4 — Ação corretiva**
- Descreva a ação corretiva a ser tomada
- Defina o responsável pela ação
- Defina o prazo de conclusão

**Passo 5 — Acompanhamento**
- Após o prazo, registre a verificação da eficácia
- Confirme se a NC foi resolvida
- Mude o status para **ENCERRADA**

> 💡 **Dica:** O sistema mostra automaticamente quantas NCs o mesmo parâmetro ou produto gerou nos últimos 6 meses. Muitas NCs no mesmo ponto indicam problema crônico que precisa de ação preventiva.

---

# CAPÍTULO 10 — EMISSÃO DE LAUDOS

**Onde:** Menu lateral → **Laudos** → selecione a OS → **Emitir laudo**

> O laudo só pode ser emitido após o Responsável Técnico aprovar os resultados.

## Tipos de documento

| Documento | Quando usar |
|-----------|-------------|
| **Laudo de análise** | Resultado de uma OS específica |
| **Certificado de Análise (CoA)** | Para enviar ao fornecedor sobre insumo |
| **Relatório de rastreabilidade** | Todos os resultados de um lote completo |
| **Boletim de qualidade mensal** | Resumo estatístico do mês |

## O que aparece no laudo automaticamente

- Logo do laboratório
- Razão social, CNPJ, endereço
- Nome e registro do Responsável Técnico (CRF/CRQ/CRBio)
- Assinatura digital do RT
- Número de autorização MAPA
- Registro ANVISA
- Acreditação INMETRO ISO 17025
- Licença Vigilância Sanitária
- Dados do cliente e produto
- Número da OS e do lote
- Tabela de resultados com conformidade
- Conclusão: APROVADO / REPROVADO / APROVADO COM RESTRIÇÕES
- QR Code de verificação de autenticidade
- Rodapé com validade e número de página

## Enviar laudo ao cliente

- Após emitir, clique em **Enviar por email**
- O cliente recebe automaticamente no email cadastrado
- O laudo também fica disponível no **Portal do Cliente**

---

# CAPÍTULO 11 — CONTROLE DE EQUIPAMENTOS

**Onde:** Menu lateral → **Equipamentos** → botão **Novo equipamento**

## Cadastrar equipamento

- Nome (ex: pHmetro Metrohm 827)
- Modelo | Fabricante | Número de série
- Número de patrimônio (se houver)
- Data da última calibração
- Data da próxima calibração
- Upload do certificado de calibração (PDF)

## Status automático

| Status | Situação |
|--------|----------|
| ✅ CALIBRADO | Dentro do prazo |
| ⚠️ ATENÇÃO | Vencendo em 30 dias |
| ❌ VENCIDO | Calibração expirada |

> ⚠️ **Importante:** Equipamento com calibração vencida fica bloqueado automaticamente. Não é possível selecionar esse equipamento ao lançar resultados.

## Manutenção

- Registre cada manutenção realizada (data, tipo, responsável, observações)
- O histórico completo fica registrado no sistema

---

# CAPÍTULO 12 — REGISTROS DE BPF E CIP

## BPF — Boas Práticas de Fabricação

**Onde:** Menu lateral → **BPF**

Registre diariamente por turno:
- Higiene pessoal dos manipuladores (verificação)
- Limpeza e sanitização de equipamentos e superfícies
- Condições das instalações
- Controle de pragas (visita do dedetizador, isca monitorada)
- Controle de temperatura das câmaras frias

## CIP — Clean-In-Place (Limpeza no local)

**Onde:** Menu lateral → **CIP** → botão **Novo registro**

- Data e hora
- Equipamento ou linha limpa (ex: Linha de envase 1, Tanque de xarope A)
- Responsável
- Concentração da solução de limpeza (%)
- Temperatura da solução (°C)
- Tempo de contato (minutos)
- Resultado microbiológico pós-CIP (swab)
- Status: APROVADO | REPROCESSAR

> ⚠️ **Exigência MAPA (Portaria 1343/2025):** todos os registros de limpeza e sanitização devem ser mantidos e apresentados em fiscalização.

---

# CAPÍTULO 13 — APPCC — PONTOS CRÍTICOS DE CONTROLE

**Onde:** Menu lateral → **APPCC**

## Cadastrar um PCC

**Passo 1 — Identificação**
- Número do PCC (PCC-01, PCC-02...)
- Etapa do processo (ex: Pasteurização, Carbonatação)
- Tipo de perigo: Biológico | Químico | Físico
- Descrição do perigo

**Passo 2 — Limites críticos**
- Limite crítico mínimo (ex: 72°C para pasteurização)
- Limite crítico máximo (se aplicável)
- Unidade de medida

**Passo 3 — Monitoramento**
- Frequência de monitoramento (por turno, por hora, contínuo)
- Responsável pelo monitoramento
- Ação corretiva predefinida se limite for ultrapassado

## Registrar leitura diária do PCC

**Onde:** APPCC → clique no PCC → **Nova leitura**

- Data e hora
- Valor medido
- Nome do responsável
- Observações

> ⚠️ **Se o valor ultrapassar o limite crítico:** o sistema abre uma NC automaticamente, notifica o RT e registra a ação corretiva tomada.

---

# CAPÍTULO 14 — AUDITORIA INTERNA E EXTERNA

**Onde:** Menu lateral → **Auditoria** → botão **Nova auditoria**

## Cadastrar auditoria

**Passo 1 — Tipo**
- Interna (BPF, ISO 22000) ou Externa (ANVISA, MAPA, INMETRO, Vigilância Sanitária, Certificadora)

**Passo 2 — Dados gerais**
- Número da auditoria (gerado automaticamente)
- Data de início e término
- Auditor responsável (e credencial, se externa)
- Áreas a auditar

**Passo 3 — Checklist**
Para cada item do checklist, marque:
- ✅ CONFORME
- ❌ NÃO CONFORME → abre NC vinculada automaticamente
- N/A NÃO APLICÁVEL
- Observação (campo livre)

**Passo 4 — Resultado (auditoria externa)**
- APROVADO | APROVADO COM RESSALVAS | REPROVADO
- Upload do relatório oficial recebido
- Prazo de resposta às NCs (quando exigido pelo órgão)

**Passo 5 — Relatório**
- Clique em **Gerar relatório** para exportar PDF com % de conformidade por área

---

# CAPÍTULO 15 — DECLARAÇÃO ANUAL DE PRODUÇÃO (MAPA)

**Onde:** Menu lateral → **Declaração Anual**

> Obrigatória: todo estabelecimento deve declarar ao MAPA até **31 de janeiro** de cada ano a produção e estoques do ano anterior. (Decreto 6.871/2009)

## Como gerar

**Passo 1** — Selecione o **ano de referência**

**Passo 2** — O sistema consolida automaticamente dos lotes registrados:
- Quantidade produzida por produto (litros e unidades)
- Quantidade vendida (expedida)
- Estoque em 31/dezembro

**Passo 3** — Revise os dados e corrija se necessário

**Passo 4** — Clique em **Gerar declaração** (PDF no formato MAPA)

**Passo 5** — Entregue à SFA (Superintendência Federal de Agricultura) do seu estado até 31 de janeiro

**Passo 6** — Registre a **data de envio** e mude o status para **ENVIADA**

> ⚠️ **O sistema alerta automaticamente** em dezembro de cada ano lembrando que a declaração está próxima do prazo.

---

# CAPÍTULO 16 — RELATÓRIOS E RASTREABILIDADE

**Onde:** Menu lateral → **Relatórios**

## Relatórios disponíveis

| Relatório | O que mostra |
|-----------|-------------|
| **Rastreabilidade do lote** | Todos os insumos, análises e resultados de um lote |
| **Histórico do produto** | Todos os lotes de um produto em um período |
| **Relatório de NCs** | Não conformidades por período, produto ou parâmetro |
| **Boletim mensal de qualidade** | Resumo estatístico do mês |
| **Livro de produção** | Registro cronológico para fiscalização MAPA |
| **Relatório de custos** | Custo de insumos e embalagens por lote/produto |
| **Desempenho de fornecedores** | % de aprovação por fornecedor |
| **Validades críticas** | Insumos e registros vencendo |
| **CEP — Cartas de controle** | Tendências de pH, Brix e CO₂ |

## Como usar a rastreabilidade

**Para rastrear um lote de produto:**
1. Vá em **Lotes** e busque o número do lote
2. Clique em **Rastreabilidade completa**
3. Veja todos os insumos usados, com lotes dos fornecedores
4. Veja todos os resultados de análise em cada etapa

**Para rastrear um insumo:**
1. Vá em **Insumos** e selecione o lote do insumo
2. Clique em **Onde foi usado**
3. Veja todos os lotes de produto que usaram esse insumo

---

# CAPÍTULO 17 — PORTAL DO CLIENTE

**Acesso:** endereço do sistema + **/portal**

> O portal é uma área separada onde cada cliente acessa com login próprio e vê apenas os laudos da sua empresa.

## Como cadastrar acesso para um cliente

1. Vá em **Clientes**
2. Clique no cliente
3. Clique em **Criar acesso ao portal**
4. Defina email e senha provisória
5. O cliente recebe as credenciais por email

## O que o cliente vê no portal

- Dashboard com % de aprovação dos seus produtos
- Lista de todos os laudos emitidos com filtros por período, produto e lote
- Botão de download de cada laudo em PDF
- Gráfico de evolução dos parâmetros ao longo do tempo
- Notificação por email quando novo laudo fica disponível

## O que o cliente NÃO vê

- Dados de outros clientes
- Módulos internos do laboratório
- Não conformidades internas
- Custos e financeiro

---

# CAPÍTULO 18 — CONFIGURAÇÕES DO LABORATÓRIO

**Onde:** Menu lateral → **Configurações** *(apenas administradores)*

> ⚠️ **Faça isso antes de qualquer coisa.** Esses dados aparecem em todos os laudos e documentos.

## Dados do laboratório

- Razão social e nome fantasia
- CNPJ | Inscrição Estadual
- Endereço completo | CEP | Cidade | Estado
- Telefone | Email | Site
- **Upload da logo** (aparece no cabeçalho de todos os laudos)

## Responsável Técnico (RT)

- Nome completo
- Formação (Farmacêutico, Químico, Biólogo, Engenheiro de Alimentos)
- Número do registro profissional (CRF / CRQ / CRBio / CREA)
- **Upload da assinatura digital** (imagem PNG com fundo transparente)

## Autorizações e registros obrigatórios

| Registro | Campo |
|----------|-------|
| Autorização MAPA | Número + data de validade |
| Registro ANVISA | Número + data de validade |
| Acreditação INMETRO | Número CRL + validade + escopo |
| Vigilância Sanitária | Número + órgão + validade |
| IBAMA | Número do cadastro (se aplicável) |

> ⚠️ **O sistema alerta automaticamente** quando qualquer autorização estiver vencendo nos próximos 60 dias.

## Gestão de usuários

- Cadastre cada analista com email, nome e perfil de acesso
- Perfis disponíveis:
  * **Administrador** — acesso total
  * **Responsável Técnico** — aprovação de resultados e laudos
  * **Analista** — lançamento de resultados
  * **Operador de produção** — registro de lotes

---

# DÚVIDAS FREQUENTES

**P: O sistema criou uma NC que não deveria. O que faço?**
R: Vá em Não conformidades, abra a NC e clique em **Cancelar NC** com justificativa. Apenas o RT pode cancelar NCs.

**P: Errei um resultado já lançado. Posso corrigir?**
R: Sim, mas apenas se o laudo ainda não foi emitido. Vá na OS, clique no resultado e em **Editar**. Após emissão do laudo, entre em contato com o administrador.

**P: Como sei quais análises preciso fazer em cada lote?**
R: O sistema sugere automaticamente os parâmetros com base no produto cadastrado e no tipo de amostra selecionado na OS.

**P: O cliente não recebeu o laudo por email. O que faço?**
R: Vá em Laudos, localize o laudo e clique em **Reenviar por email**. Verifique se o email do cliente está correto em Clientes.

**P: Como adicionar um novo parâmetro de análise?**
R: Vá em Produtos, selecione o produto e clique em **Especificações** → **Adicionar parâmetro**.

---

# SUPORTE

Para dúvidas ou problemas técnicos:
- Email: suporte@limsqual.com.br
- WhatsApp: (43) 9 9999-9999
- Portal de suporte: suporte.limsqual.com.br

---

*LimsQual — Sistema de Gestão de Qualidade para Indústria de Bebidas*
*Versão 1.0 — 2026 — Todos os direitos reservados*
