import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "../config/env.js";
import type { UniversityCreateManyInput } from "../generated/prisma/models.js";

const __dirname = import.meta.dirname;

const connectionString =
  env.NODE_ENV === "test" ? env.TEST_DATABASE_URL : env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Database URL not found in environment variables.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const filePath = path.resolve(__dirname, "../../JSON_files/universities.json");
const JSONdata = fs.readFileSync(filePath, "utf-8");

async function main() {
  try {
    // eslint-disable-next-line no-console
    console.log("Seeding universities...");

    const universities = JSON.parse(JSONdata) as UniversityCreateManyInput[];

    const result = await prisma.university.createMany({
      data: universities,
      skipDuplicates: true,
    });

    // eslint-disable-next-line no-console
    console.log(`Inserted ${result.count.toString()} new universities.`);
  } catch (error: unknown) {
    console.error("Error seeding universities:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
await main();
