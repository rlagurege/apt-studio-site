import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import { artists } from "../src/content/artists.js";
import { staff } from "../src/lib/staff.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes("johndoe") || connectionString.includes("randompassword")) {
  console.error("❌ DATABASE_URL is not configured or is using placeholder.");
  console.error("Please set a valid DATABASE_URL in your .env file.");
  console.error("\nExample:");
  console.error('DATABASE_URL="postgresql://user:password@localhost:5432/apt_studio?schema=public"');
  console.error("\nOr use a free PostgreSQL database from:");
  console.error("- Neon: https://neon.tech");
  console.error("- Supabase: https://supabase.com");
  console.error("- Railway: https://railway.app");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

async function main() {
  console.log("🌱 Starting database seed...");

  // Create tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "apt-studios" },
    update: {},
    create: { name: "APT Studios", slug: "apt-studios", timezone: "America/New_York" },
  });
  console.log("✅ Tenant created:", tenant.slug);

  // Create roles
  const [adminRole, schedulerRole, artistRole] = await Promise.all([
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
  console.log("✅ Roles created: Admin, Scheduler, Artist");

  // Create Tammi (Admin/Scheduler)
  const tammy = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "tammi-gomula@apt.com" } },
    update: { name: "Tammi Gomula" },
    create: { 
      tenantId: tenant.id, 
      email: "tammi-gomula@apt.com", 
      name: "Tammi Gomula", 
      status: "active" 
    },
  });
  
  // Assign Tammi roles
  await prisma.userRole.upsert({
    where: { 
      tenantId_userId_roleId: { 
        tenantId: tenant.id, 
        userId: tammy.id, 
        roleId: adminRole.id 
      } 
    },
    update: {},
    create: { tenantId: tenant.id, userId: tammy.id, roleId: adminRole.id },
  });
  await prisma.userRole.upsert({
    where: { 
      tenantId_userId_roleId: { 
        tenantId: tenant.id, 
        userId: tammy.id, 
        roleId: schedulerRole.id 
      } 
    },
    update: {},
    create: { tenantId: tenant.id, userId: tammy.id, roleId: schedulerRole.id },
  });
  console.log("✅ Tammi Gomula created (Admin/Scheduler)");

  // Create all artists from content/artists.ts
  const artistUsers = [];
  for (const artist of artists) {
    // Use slug-based email for matching
    const email = `${artist.slug}@apt.com`;
    const user = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email } },
      update: { name: artist.name },
      create: { 
        tenantId: tenant.id, 
        email,
        name: artist.name, 
        status: "active" 
      },
    });

    // Assign Artist role
    await prisma.userRole.upsert({
      where: { 
        tenantId_userId_roleId: { 
          tenantId: tenant.id, 
          userId: user.id, 
          roleId: artistRole.id 
        } 
      },
      update: {},
      create: { tenantId: tenant.id, userId: user.id, roleId: artistRole.id },
    });

    // Check if this artist is also an admin in staff list
    const staffMember = staff.find((s) => s.slug === artist.slug && s.role === "admin");
    if (staffMember) {
      // Assign Admin role
      await prisma.userRole.upsert({
        where: { 
          tenantId_userId_roleId: { 
            tenantId: tenant.id, 
            userId: user.id, 
            roleId: adminRole.id 
          } 
        },
        update: {},
        create: { tenantId: tenant.id, userId: user.id, roleId: adminRole.id },
      });
      console.log(`   - ${artist.name} also assigned Admin role`);
    }

    artistUsers.push({ slug: artist.slug, name: artist.name, email: user.email });
  }
  console.log(`✅ Created ${artistUsers.length} artists:`);
  artistUsers.forEach(a => console.log(`   - ${a.name} (${a.slug})`));

  console.log("\n🎉 Seed complete!");
  console.log("\n📝 Next steps:");
  console.log("1. Make sure ARTIST_PASSWORDS and STAFF_PASSWORDS are set in .env");
  console.log("2. Run migrations: npx prisma migrate dev");
  console.log("3. Artists can now log in using their slug and password");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
