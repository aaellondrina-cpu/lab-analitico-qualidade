---
name: lims-qualidade
description: >
  Skill do módulo de gestão da qualidade do LIMS Ambiental — projeto localizado em
  /AAEL-LIMS/lims-qualidade. Use este skill sempre que o trabalho envolver documentos
  da qualidade, controle de equipamentos, registros de não conformidade, auditorias,
  calibração, POP (Procedimento Operacional Padrão), indicadores de qualidade,
  requisitos da ISO/IEC 17025:2017, acoes corretivas, validação de métodos, 
  rastreabilidade metrológica, ou qualquer módulo do sistema de gestão da qualidade.
  Triggers: "qualidade", "lims-qualidade", "POP", "não conformidade", "NC",
  "calibração", "equipamento", "auditoria", "indicador", "validação de método",
  "incerteza de medição", "rastreabilidade", "documento controlado", "registro".
---

# LIMS Qualidade — Módulo de Gestão da Qualidade

## Identidade do Projeto

| Campo | Valor |
|---|---|
| Path local | /AAEL-LIMS/lims-qualidade |
| Empresa | AAEL Análises Ambientais |
| Localização | Londrina, Paraná, Brasil |
| Responsável Técnico | Patricio Serafini — CRQ 094039-01 |
| Norma regente | ISO/IEC 17025:2017 |
| Propósito | Gestão do Sistema de Qualidade do laboratório |

## Regra Absoluta

**NUNCA usar "acreditado"** — sempre "de acordo com ISO 17025" ou "conforme ISO 17025".
O laboratório opera **conforme** a norma, não é acreditado pelo INMETRO (usar essa distinção sempre).

## Requisitos da ISO/IEC 17025:2017 Cobertos

### Seção 4 — Requisitos Gerais
- 4.1 Imparcialidade
- 4.2 Confidencialidade

### Seção 5 — Requisitos Estruturais
- 5.1 Estrutura organizacional
- 5.2 Pessoal competente e responsabilidades

### Seção 6 — Requisitos de Recursos
- 6.2 Pessoal (qualificação, treinamento, registro)
- 6.3 Instalações e condições ambientais
- 6.4 Equipamentos (calibração, manutenção, identificação)
- 6.5 Rastreabilidade metrológica
- 6.6 Produtos e serviços fornecidos externamente

### Seção 7 — Requisitos de Processo
- 7.1 Análise crítica de pedidos
- 7.2 Seleção, verificação e validação de métodos
- 7.3 Amostragem
- 7.4 Manuseio de itens de ensaio
- 7.5 Registros técnicos
- 7.6 Avaliação de incerteza de medição
- 7.7 Garantia da validade dos resultados (controle de qualidade)
- 7.8 Relato de resultados (laudos)
- 7.9 Reclamações
- 7.10 Trabalho não conforme
- 7.11 Controle de dados e gestão da informação

### Seção 8 — Requisitos do Sistema de Gestão
- 8.2 Documentação do sistema de gestão
- 8.3 Controle de documentos
- 8.4 Controle de registros
- 8.5 Ações para abordar riscos e oportunidades
- 8.6 Melhoria
- 8.7 Ações corretivas
- 8.8 Auditorias internas
- 8.9 Análises críticas pela direção

## Módulos do Sistema de Qualidade

| Módulo | Função |
|---|---|
| Documentos Controlados | Versionamento, aprovação e distribuição de POPs, instruções |
| Equipamentos | Cadastro, calibração, manutenção, identificação (TAG) |
| Calibração | Cronograma, certificados, rastreabilidade metrológica |
| Não Conformidades | Registro de NC, análise de causa, ação corretiva, verificação de eficácia |
| Auditorias Internas | Planejamento, execução, relatório, follow-up |
| Treinamentos | Registro de competência, qualificação por método, evidências |
| Controle de Qualidade | Cartas de controle, brancos, duplicatas, padrões, recuperação |
| Incerteza de Medição | Cálculo e registro por método analítico |
| Indicadores | KPIs de qualidade, tendências, análise crítica |
| Reclamações | Registro e tratamento de reclamações de clientes |
| Análise Crítica | Atas de reuniões de análise crítica pela direção |

## Estrutura de Arquivos

```
/AAEL-LIMS/lims-qualidade/
├── index.html ou main entry point
├── /documentos/
│   ├── POPs/
│   ├── instrucoes/
│   └── formularios/
├── /equipamentos/
├── /calibracao/
├── /nao-conformidades/
├── /auditorias/
├── /treinamentos/
├── /controle-qualidade/
└── /relatorios/
```

## Padrões de Nomenclatura

| Tipo | Formato | Exemplo |
|---|---|---|
| POP | POP-[ÁREA]-[NNN] | POP-LAB-001 |
| Instrução de Trabalho | IT-[ÁREA]-[NNN] | IT-COL-003 |
| Formulário | FOR-[ÁREA]-[NNN] | FOR-NC-001 |
| Registro de Equipamento | EQ-[TAG]-[NNN] | EQ-pH-001 |
| Não Conformidade | NC-[ANO]-[NNN] | NC-2025-042 |
| Auditoria | AUD-[ANO]-[NNN] | AUD-2025-001 |

## O que Fazer Sem Perguntar

- Criar templates de formulários ISO 17025
- Gerar numeração sequencial de documentos seguindo o padrão acima
- Adicionar campos obrigatórios de rastreabilidade (data, responsável, versão, aprovação)
- Criar POPs com estrutura padrão (objetivo, escopo, responsável, procedimento, referências)
- Calcular e exibir prazos de calibração com base em última data + frequência definida

## O que Sempre Confirmar Antes

- Alterar VMPs ou limites analíticos referenciados
- Arquivar ou inativar um documento controlado
- Alterar workflow de aprovação de documentos
- Mudar frequência de calibração de equipamentos
- Alterar requisitos que mapeiam itens específicos da 17025

## Campos Obrigatórios em Todo Documento

Todo documento do sistema de qualidade deve conter:
- Título e código
- Versão e data de emissão
- Elaborado por / Aprovado por / Data de aprovação
- Número de páginas
- Histórico de revisões

## Referências

- `references/iso17025-requisitos.md` — mapeamento completo dos requisitos por seção
- `references/equipamentos-lista.md` — lista de equipamentos, TAGs e frequências de calibração
- `references/metodos-validados.md` — métodos analíticos validados/verificados e suas incertezas
