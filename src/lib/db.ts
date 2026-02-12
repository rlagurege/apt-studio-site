import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const connectionString = process.env.DATABASE_URL;

// Only initialize Prisma if DATABASE_URL is set and valid (not placeholder)
let prismaInstance: PrismaClient | null = null;

if (connectionString && !connectionString.includes("johndoe") && !connectionString.includes("randompassword")) {
  try {
    const pool = new Pool({
      connectionString,
    });
    const adapter = new PrismaPg(pool);

    const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

    prismaInstance =
      globalForPrisma.prisma ??
      new PrismaClient({
        adapter, // Required in Prisma v7 for engine type "client"
        log: ["error", "warn"],
      });

    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaInstance;
  } catch (error) {
    console.error("[DB] Failed to initialize Prisma:", error);
    prismaInstance = null;
  }
} else {
  console.warn("[DB] DATABASE_URL not configured or using placeholder. Prisma features will be unavailable.");
}

// Export a proxy that throws helpful errors if Prisma isn't initialized
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!prismaInstance) {
      throw new Error(
        "Prisma Client is not initialized. Please set a valid DATABASE_URL in your .env file."
      );
    }
    return (prismaInstance as any)[prop];
  },
});
