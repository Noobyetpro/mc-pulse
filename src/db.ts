import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "./config.js";
import { PrismaClient } from "./generated/prisma/client.js";

const dbUrl = new URL(config.databaseUrl);

// Remove options param to avoid Neon pooler startup errors.
dbUrl.searchParams.delete("options");

const pool = new Pool({
  connectionString: dbUrl.toString(),
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export async function disconnectDatabase() {
  await Promise.allSettled([prisma.$disconnect(), pool.end()]);
}
