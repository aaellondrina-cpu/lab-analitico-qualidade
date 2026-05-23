import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@limsqual.app";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@2026";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Administrador";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: passwordHash,
      name: adminName,
      role: "ADMIN",
    },
  });

  console.log(`OK Admin pronto: ${user.email} (role=${user.role})`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(`   Senha padrao (troque em prod): ${adminPassword}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
