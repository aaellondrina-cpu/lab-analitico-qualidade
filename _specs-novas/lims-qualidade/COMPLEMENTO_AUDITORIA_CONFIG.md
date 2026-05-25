# COMPLEMENTO — Adicionar ao sistema LIMS já existente

## ADICIONAR ROTA: /auditorias

### Auditoria Interna
- Número | Data | Área auditada | Auditor responsável
- Tipo: BPF | ISO 22000 | FSSC 22000 | ISO 17025 | ANVISA | MAPA | Interna
- Checklist por área:
  * Higiene e sanitização
  * Controle de pragas
  * Rastreabilidade
  * Calibração de equipamentos
  * Documentação e registros
  * Treinamento de pessoal
  * Condições das instalações
- Cada item do checklist: CONFORME | NÃO CONFORME | NÃO APLICÁVEL | OBSERVAÇÃO
- Não conformidades encontradas → vinculadas ao módulo de NCs existente
- Ações corretivas | Responsável | Prazo
- Status: PLANEJADA | EM ANDAMENTO | CONCLUÍDA | AGUARDANDO VERIFICAÇÃO
- Relatório de auditoria em PDF

### Auditoria Externa
- Todos os campos acima +
- Órgão auditador: ANVISA | MAPA | INMETRO | Vigilância Sanitária | Cliente | Certificadora
- Nome do auditor externo | Credencial
- Resultado: APROVADO | APROVADO COM RESSALVAS | REPROVADO
- Upload do relatório oficial recebido (PDF)
- Prazo de resposta às NCs (quando exigido pelo órgão)

### Histórico de Auditorias
- Lista cronológica de todas as auditorias
- Filtros por tipo, órgão, status, período
- % de conformidade por auditoria
- Evolução ao longo do tempo (gráfico de linha)

---

## ADICIONAR ROTA: /configuracoes

### Dados do Laboratório (usados em TODOS os laudos e relatórios)

#### Identificação:
- Razão Social | Nome Fantasia
- CNPJ | Inscrição Estadual
- Endereço completo | CEP | Cidade | Estado
- Telefone | Email | Site
- Upload da logo (aparece no cabeçalho dos laudos)

#### Responsável Técnico (RT):
- Nome completo
- Formação: Farmacêutico | Químico | Biólogo | Engenheiro de Alimentos | Outro
- Número do registro profissional (CRF / CRQ / CRBio / CREA)
- Upload da assinatura digital (imagem PNG transparente)

#### Autorizações e Registros (aparecem no cabeçalho dos laudos):
- **Autorização MAPA** → número + validade
- **Registro ANVISA** → número + validade
- **Acreditação INMETRO/CGCRE ISO 17025** → número CRL + validade + escopo
- **Licença Vigilância Sanitária** → número + órgão emissor + validade
- **IBAMA** → número do cadastro (se aplicável)
- Campo livre para outros registros/autorizações

#### Modelo de Cabeçalho dos Laudos:
```
[LOGO]  NOME DO LABORATÓRIO
        CNPJ: XX.XXX.XXX/XXXX-XX | Endereço | Tel | Email
────────────────────────────────────────────────────────
RT: [Nome] — [Formação] | [Registro profissional nº XXXXX]
Autorização MAPA nº XXXXXX | ANVISA nº XXXXXX
Acreditado INMETRO CRL-XXXX — ISO/IEC 17025
────────────────────────────────────────────────────────
LAUDO DE ANÁLISE Nº XXXXX/2026
OS: OS-2026-0001 | Data: DD/MM/AAAA | Validade: DD/MM/AAAA
```

#### Rodapé dos Laudos:
- "Este laudo só é válido na íntegra. Reprodução parcial requer autorização."
- "Laboratório acreditado pelo INMETRO conforme ABNT NBR ISO/IEC 17025"
- QR Code de verificação de autenticidade
- Página X de Y | Data e hora de emissão

#### Pré-visualização:
- Tela mostra em tempo real como ficará o cabeçalho no laudo
- Botão "Salvar" — aplica automaticamente em todos os documentos futuros

---

## ADICIONAR NO BANCO DE DADOS (schema Prisma):

```prisma
model ConfiguracaoLaboratorio {
  id                    String   @id @default(cuid())
  razaoSocial           String
  nomeFantasia          String?
  cnpj                  String
  inscricaoEstadual     String?
  endereco              String
  cep                   String
  cidade                String
  estado                String
  telefone              String
  email                 String
  site                  String?
  logoUrl               String?
  rtNome                String
  rtFormacao            String
  rtRegistro            String
  rtAssinaturaUrl       String?
  mapaNumero            String?
  mapaValidade          DateTime?
  anvisaNumero          String?
  anvisaValidade        DateTime?
  inmetroNumero         String?
  inmetroValidade       DateTime?
  inmetroEscopo         String?
  vigilanciaNumero      String?
  vigilanciaOrgao       String?
  vigilanciaValidade    DateTime?
  ibamaNumero           String?
  outrosRegistros       Json?
  updatedAt             DateTime @updatedAt
}

model Auditoria {
  id              String   @id @default(cuid())
  numero          String   @unique
  tipo            String   // INTERNA | EXTERNA
  orgao           String?  // ANVISA, MAPA, INMETRO, etc (apenas externa)
  auditorNome     String
  auditorCredencial String?
  dataInicio      DateTime
  dataFim         DateTime?
  areas           String[]
  status          String   @default("PLANEJADA")
  resultado       String?  // APROVADO | APROVADO_COM_RESSALVAS | REPROVADO
  relatorioUrl    String?
  prazoResposta   DateTime?
  itens           ItemAuditoria[]
  createdAt       DateTime @default(now())
}

model ItemAuditoria {
  id           String    @id @default(cuid())
  auditoria    Auditoria @relation(fields: [auditoriaId], references: [id])
  auditoriaId  String
  area         String
  item         String
  resultado    String    // CONFORME | NAO_CONFORME | NAO_APLICAVEL
  observacao   String?
  ncId         String?
}
```

---

## ADICIONAR NO MENU DE NAVEGAÇÃO:
- /auditorias → ícone de prancheta
- /configuracoes → ícone de engrenagem (apenas admin)
