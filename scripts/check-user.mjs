import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const email = "admin@limsqual.app";
const password = "Admin@2026";

const user = await prisma.user.findUnique({ where: { email } });
console.log("user:", user ? { id: user.id, email: user.email, name: user.name, role: user.role, hashStart: user.password.slice(0, 7) } : null);

if (user) {
  const ok = await bcrypt.compare(password, user.password);
  console.log("bcrypt.compare:", ok);
}
await prisma.$disconnect();
