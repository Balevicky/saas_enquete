import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Début du seeding Phase A...");

  // 1️⃣ Tenant par défaut
  const tenant = await prisma.tenant.upsert({
    where: { slug: "default-tenant" },
    update: {},
    create: {
      name: "Default Tenant",
      slug: "default-tenant",
      settings: {},
    },
  });

  // 2️⃣ Admin user par défaut
  const adminPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@default.com" },
    update: {},
    create: {
      email: "admin@default.com",
      password: adminPassword,
      fullName: "Admin Default",
    },
  });

  await prisma.userTenant.upsert({
    where: { userId_tenantId: { userId: adminUser.id, tenantId: tenant.id } },
    update: {},
    create: {
      userId: adminUser.id,
      tenantId: tenant.id,
      role: "OWNER",
    },
  });

  // 3️⃣ Régions + Départements + Secteurs + Villages (exemple)
  const region = await prisma.region.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Region 1" } },
    update: {},
    create: { name: "Region 1", tenantId: tenant.id },
  });

  const departement = await prisma.departement.upsert({
    where: {
      tenantId_regionId_name: {
        tenantId: tenant.id,
        regionId: region.id,
        name: "Departement 1",
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      regionId: region.id,
      name: "Departement 1",
    },
  });

  const secteur = await prisma.secteur.upsert({
    where: {
      tenantId_departementId_name: {
        tenantId: tenant.id,
        departementId: departement.id,
        name: "Secteur 1",
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      departementId: departement.id,
      name: "Secteur 1",
    },
  });
await prisma.village.upsert({
  where: {
    tenantId_secteurId_name: {
      tenantId: tenant.id,
      secteurId: secteur.id,
      name: "Village 1",
    },
  },
  update: {},
  create: {
    tenantId: tenant.id,
    secteurId: secteur.id,
    name: "Village 1",
  },
});


  // 4️⃣ Invitations exemples
  await prisma.invite.upsert({
    where: { token: "invite-token-1" },
    update: {},
    create: {
      email: "user1@tenant.com",
      tenantId: tenant.id,
      role: "USER",
      token: "invite-token-1",
    },
  });

  console.log("✅ Seeding Phase A terminé !");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
