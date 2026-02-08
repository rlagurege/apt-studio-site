import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "apt-studios" },
    update: {},
    create: { name: "APT Studios", slug: "apt-studios", timezone: "America/New_York" },
  });

  // Roles
  const [admin, scheduler, artist] = await Promise.all([
    prisma.role.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: "Admin" } },
      update: {},
      create: { tenantId: tenant.id, name: "Admin", permissions: ["*"] as any },
    }),
    prisma.role.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: "Scheduler" } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: "Scheduler",
        permissions: ["requests.read","requests.write","appointments.read","appointments.write"] as any,
      },
    }),
    prisma.role.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: "Artist" } },
      update: {},
      create: { tenantId: tenant.id, name: "Artist", permissions: ["appointments.read","appointments.write"] as any },
    }),
  ]);

  // Users (Tammy + a couple artists)
  const tammy = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "tammy@apt.com" } },
    update: {},
    create: { tenantId: tenant.id, email: "tammy@apt.com", name: "Tammy", status: "active" },
  });

  const russ = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "russ@apt.com" } },
    update: {},
    create: { tenantId: tenant.id, email: "russ@apt.com", name: "Russ", status: "active" },
  });

  // Assign roles
  await prisma.userRole.createMany({
    data: [
      { tenantId: tenant.id, userId: tammy.id, roleId: scheduler.id },
      { tenantId: tenant.id, userId: russ.id, roleId: artist.id },
      { tenantId: tenant.id, userId: russ.id, roleId: admin.id },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete:", { tenant: tenant.slug, tammy: tammy.email, russ: russ.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
