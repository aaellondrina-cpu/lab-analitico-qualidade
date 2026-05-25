import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BOOTSTRAP_TOKEN = "limsqual-demo-bootstrap-2026";

async function bootstrap(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (token !== BOOTSTRAP_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const adminEmail = "admin@limsqual.app";
  const adminPassword = "Admin@2026";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: passwordHash,
      name: "Administrador",
      role: "ADMIN",
    },
  });

  return NextResponse.json({
    ok: true,
    user: { email: user.email, role: user.role },
    message: "Admin criado. Acesse /login com admin@limsqual.app / Admin@2026",
  });
}

export const GET = bootstrap;
export const POST = bootstrap;
