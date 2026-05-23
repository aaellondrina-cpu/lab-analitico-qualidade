# LimsQual — Controle de Qualidade

LIMS (Laboratory Information Management System) para indústria de bebidas e refrigerantes. Em conformidade com **RDC 331/2019**, **ISO 17025** e **ISO 22000**.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind v4** (CSS-first config)
- **Prisma 7** + **PostgreSQL (Neon)**
- **NextAuth** (autenticação)
- **bcryptjs** + **zod**

## Setup local

```bash
# 1. Variáveis de ambiente
cp .env.example .env
# preencha DATABASE_URL e NEXTAUTH_SECRET

# 2. Banco
npx prisma generate
npx prisma db push   # cria as tabelas no Neon

# 3. Dev server
npm run dev
# abre em http://localhost:3000
```

## Estrutura

```
lims-qualidade/
├── docs/
│   └── spec-original.txt        ← prompt/spec original do projeto
├── prisma/
│   └── schema.prisma            ← 9 models: User, Cliente, Produto,
│                                  Especificacao, PontoColeta, Amostra,
│                                  Resultado, NaoConformidade, Equipamento
├── src/
│   ├── app/
│   │   ├── page.tsx             ← landing pública
│   │   ├── login/               ← /login
│   │   └── (app)/               ← rotas autenticadas (com sidebar)
│   │       ├── dashboard/
│   │       ├── amostras/        ← list, nova, [id]
│   │       ├── produtos/
│   │       ├── clientes/
│   │       ├── laudos/
│   │       ├── nao-conformidades/
│   │       ├── equipamentos/
│   │       └── relatorios/
│   ├── components/
│   │   ├── Logo.tsx
│   │   ├── Sidebar.tsx
│   │   └── PageHeader.tsx
│   └── lib/
│       └── prisma.ts            ← singleton PrismaClient
```

## Identidade visual

- **Petróleo** `#0D3B5E` — header, primários
- **Água** `#00B4D8` — focus rings, destaques
- **Logo**: gota d'água + molécula (SVG em `src/components/Logo.tsx`)

## Próximos passos

1. Criar projeto Neon e preencher `DATABASE_URL` no `.env`
2. `npx prisma db push` pra criar as tabelas
3. Implementar NextAuth credenciais (route handler em `src/app/api/auth/[...nextauth]/route.ts`)
4. Conectar páginas placeholder ao banco (server components com `prisma`)
5. Subir pro GitHub: `LAB-ANALITICS-AAEL/lims-qualidade`
6. Deploy Vercel + env vars

## Status atual

Scaffold inicial — todas as 11 rotas existem como placeholder. Schema Prisma completo. Sem conexão com banco ainda. Autenticação placeholder (form aponta pra `/api/auth/callback/credentials` mas a rota não existe).
