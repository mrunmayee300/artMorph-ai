import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!@#", 12);
  const demoPassword = await bcrypt.hash("Demo1234!@#", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@artmorph.ai" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@artmorph.ai",
      name: "Admin User",
      passwordHash: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  await prisma.creditBalance.upsert({
    where: { userId: admin.id },
    update: { balance: 5000 },
    create: { userId: admin.id, balance: 5000 },
  });

  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: { plan: "TEAM", status: "ACTIVE" },
    create: { userId: admin.id, plan: "TEAM", status: "ACTIVE" },
  });

  const demo = await prisma.user.upsert({
    where: { email: "demo@artmorph.ai" },
    update: {},
    create: {
      email: "demo@artmorph.ai",
      name: "Demo User",
      passwordHash: demoPassword,
      emailVerified: new Date(),
    },
  });

  await prisma.creditBalance.upsert({
    where: { userId: demo.id },
    update: { balance: 20 },
    create: { userId: demo.id, balance: 20 },
  });

  await prisma.subscription.upsert({
    where: { userId: demo.id },
    update: {},
    create: { userId: demo.id, plan: "FREE", status: "ACTIVE" },
  });

  await prisma.project.upsert({
    where: { id: "seed-project-1" },
    update: {},
    create: {
      id: "seed-project-1",
      userId: demo.id,
      name: "Getting Started",
      description: "Your first project",
    },
  });

  console.log("Seed completed:");
  console.log("  Admin: admin@artmorph.ai / Admin123!@#");
  console.log("  Demo:  demo@artmorph.ai / Demo1234!@#");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
