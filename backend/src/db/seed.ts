import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";

import { env } from "../config/env.js";
import { PrismaClient } from "../generated/prisma/client.js";

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

const jsonData = fs.readFileSync(filePath, "utf-8");

const optionalTextSchema = z.string().trim().min(1).nullish();

const optionalDateSchema = z.iso
  .date()
  .transform((value) => new Date(value))
  .nullish();

const universitySeedSchema = z.strictObject({
  name: z.string().trim().min(1),
  acronym: optionalTextSchema,
  city: z.string().trim().min(1),
  entity: z.enum(["FBIH", "RS", "BD"]),
  ownership: z
    .enum(["Javna", "Privatna"])
    .transform((value) => (value === "Javna" ? "JAVNA" : "PRIVATNA")),
  foundedYear: optionalTextSchema,
  website: optionalTextSchema,
  accreditationFrom: optionalDateSchema,
  accreditationTo: optionalDateSchema,
  authority: optionalTextSchema,
  sourceUrl: optionalTextSchema,
  lastChecked: optionalDateSchema,
});

const universitiesSeedSchema = z.array(universitySeedSchema);

function toUniversityCreateManyInput(
  university: z.infer<typeof universitySeedSchema>,
): UniversityCreateManyInput {
  return {
    name: university.name,
    acronym: university.acronym ?? null,
    city: university.city,
    entity: university.entity,
    ownership: university.ownership,
    foundedYear: university.foundedYear ?? null,
    website: university.website ?? null,
    accreditationFrom: university.accreditationFrom ?? null,
    accreditationTo: university.accreditationTo ?? null,
    authority: university.authority ?? null,
    sourceUrl: university.sourceUrl ?? null,
    lastChecked: university.lastChecked ?? null,
  };
}

async function main() {
  try {
    // eslint-disable-next-line no-console
    console.log("Seeding universities...");

    const rawUniversities = JSON.parse(jsonData) as unknown;

    const universities = universitiesSeedSchema
      .parse(rawUniversities)
      .map(toUniversityCreateManyInput);

    const result = await prisma.university.createMany({
      data: universities,
      skipDuplicates: true,
    });

    // eslint-disable-next-line no-console
    console.log(`Inserted ${result.count.toString()} new universities.`);
  } catch (error: unknown) {
    console.error("Error seeding universities:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

await main();
