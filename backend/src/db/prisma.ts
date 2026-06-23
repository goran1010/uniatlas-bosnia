import "dotenv/config.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "#generated/prisma/client.js";
import { env } from "#config/env.js";

const connectionString =
  process.env["NODE_ENV"] === "test" ? env.TEST_DATABASE_URL : env.DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
