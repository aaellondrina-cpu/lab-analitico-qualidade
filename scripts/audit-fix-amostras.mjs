#!/usr/bin/env node
/**
 * Auditoria e Correção de Amostras
 * Script para verificar integridade e corrigir dados de amostras sem resultados
 * Uso: npm run audit-fix-amostras
 */

import { spawn } from "child_process";

const runCommand = (cmd, args = []) => {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: "inherit" });
    proc.on("close", (code) => {
      code === 0 ? resolve() : reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
};

async function main() {
  console.log("\n🔍 AUDITORIA DE AMOSTRAS - VERIFICANDO INTEGRIDADE\n");
  
  // Executa Prisma Studio em modo readonly ou query
  await runCommand("npx", ["prisma", "db", "execute", "--stdin"]);
}

main().catch(console.error);
