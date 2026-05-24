"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { seedDemoLaudosForCliente } from "@/lib/portal-demo-laudos";
import { LIMITE_DEMO, type SignupState } from "./types";

function onlyDigits(s: string) {
  return (s || "").replace(/\D/g, "");
}

export async function getDemoUsage() {
  const total = await prisma.clienteUser.count();
  return { total, limite: LIMITE_DEMO, vagas: Math.max(0, LIMITE_DEMO - total) };
}

export async function signupPortalCliente(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const razaoSocial = String(formData.get("razaoSocial") ?? "").trim();
  const cnpj = String(formData.get("cnpj") ?? "").trim();
  const responsavel = String(formData.get("responsavel") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const telefone = String(formData.get("telefone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!razaoSocial || !cnpj || !responsavel || !email || !password) {
    return { error: "Preencha todos os campos obrigatórios." };
  }
  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }
  if (onlyDigits(cnpj).length !== 14) {
    return { error: "CNPJ inválido — informe 14 dígitos." };
  }

  const usage = await getDemoUsage();
  if (usage.vagas <= 0) {
    return {
      error: `Demo cheia (${LIMITE_DEMO} cadastros). Entre em contato com o laboratório.`,
    };
  }

  const cnpjExistente = await prisma.cliente.findUnique({ where: { cnpj } });
  if (cnpjExistente) {
    return { error: "Já existe um cliente cadastrado com esse CNPJ." };
  }
  const emailExistente = await prisma.clienteUser.findUnique({ where: { email } });
  if (emailExistente) {
    return { error: "Já existe um login com esse e-mail." };
  }

  const hash = await bcrypt.hash(password, 10);

  const cliente = await prisma.cliente.create({
    data: {
      razaoSocial,
      cnpj,
      responsavel,
      email,
      telefone: telefone || "—",
    },
  });

  await prisma.clienteUser.create({
    data: {
      clienteId: cliente.id,
      email,
      password: hash,
      nome: responsavel,
    },
  });

  // Popula 3 laudos demo pro portal não ficar vazio na primeira visita.
  // Falha aqui não deve derrubar o signup — o cliente ainda pode entrar.
  try {
    await seedDemoLaudosForCliente(cliente.id);
  } catch (e) {
    console.error("seedDemoLaudosForCliente falhou:", e);
  }

  return { success: { email, senha: password } };
}
