import "dotenv/config.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "#generated/prisma/client.js";
import { DATABASE_URL, TEST_DATABASE_URL } from "#config/env.js";

const connectionString =
  process.env["NODE_ENV"] === "test" ? TEST_DATABASE_URL : DATABASE_URL;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
