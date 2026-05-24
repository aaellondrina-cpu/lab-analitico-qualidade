# LimsQual — Controle de Qualidade

LIMS (Laboratory Information Management System) para indústria de bebidas e refrigerantes. Em conformidade com **RDC 331/2019**, **ISO 17025**, **ISO 22000** e **FSSC 22000**.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind v4** (CSS-first config)
- **Prisma 6** + **PostgreSQL (Neon)**
- **NextAuth** (autenticação)
- **bcryptjs** + **zod**

## Setup local

```bash
# 1. Variáveis de ambiente — puxe do Vercel ou crie manualmente
npx vercel env pull .env
# ou copie do Vercel dashboard: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# 2. Banco (cria as tabelas no Neon)
npx prisma generate
npx prisma db push

# 3. Seed admin
npm run db:seed
# admin@limsqual.app / Admin@2026

# 4. Dev server
npm run dev
# http://localhost:3000
```

## Módulos

**Operação** — Amostras, Lotes, Laudos (com QR code + verificação pública), Não Conformidades

**Cadastros** — Produtos, Clientes, Fornecedores, Insumos, Embalagens, Pontos de Coleta, Equipamentos (com calibração)

**Qualidade** — CEP/SPC (cartas Shewhart, Cp/Cpk, Regras de Nelson), APPCC/HACCP (PCCs + monitoramento)

**Pessoas & Docs** — Documentos (POPs/ITPs com versionamento), Colaboradores, Treinamentos (matriz)

**Compliance** — CIP (Clean-In-Place), Auditorias formais (BPF/ISO/ANVISA/MAPA), Relatórios (rastreabilidade por lote, boletim mensal, CSV), Trilha de auditoria, Configurações de identidade do laboratório

## Identidade visual

- **Petróleo** `#0D3B5E` — header, primários
- **Água** `#00B4D8` — focus rings, destaques

## Deploy

- **GitHub**: `LAB-ANALITICS-AAEL/lims-qualidade`
- **Vercel**: `lims-qualidade.vercel.app`
- **Banco**: Neon (Postgres)
- Build roda `prisma generate && prisma db push --accept-data-loss && next build` automaticamente
