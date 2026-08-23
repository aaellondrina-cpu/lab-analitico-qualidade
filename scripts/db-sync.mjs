// Sincroniza o schema do Prisma com o banco durante o build (Vercel).
// Nunca derruba o build: se o banco estiver indisponível, apenas avisa —
// o deploy continua e o schema pode ser sincronizado depois com `npm run db:push`.
import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log("[db-sync] DATABASE_URL ausente — pulando prisma db push.");
  process.exit(0);
}

const r = spawnSync(
  "npx",
  ["prisma", "db", "push", "--accept-data-loss", "--skip-generate"],
  { stdio: "inherit", timeout: 120_000 },
);

if (r.status !== 0) {
  console.warn("[db-sync] prisma db push falhou — seguindo com o build mesmo assim.");
}

process.exit(0);
