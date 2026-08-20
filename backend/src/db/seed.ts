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

const universitiesFilePath = path.resolve(
  __dirname,
  "../../JSON_files/universities.json",
);

const facultiesFilePath = path.resolve(
  __dirname,
  "../../JSON_files/faculties.json",
);

const universitiesJsonData = fs.readFileSync(universitiesFilePath, "utf-8");

const facultiesJsonData = fs.readFileSync(facultiesFilePath, "utf-8");

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

const facultySeedSchema = z.strictObject({
  name: z.string().trim().min(1),
  city: optionalTextSchema,
  website: optionalTextSchema,
});

// sourceUrl and lastChecked document data provenance only — the Faculty
// table has no such columns, so they are validated but not persisted.
const facultyGroupSeedSchema = z.strictObject({
  university: z.string().trim().min(1),
  sourceUrl: optionalTextSchema,
  lastChecked: optionalDateSchema,
  faculties: z.array(facultySeedSchema).min(1),
});

const facultiesSeedSchema = z.array(facultyGroupSeedSchema);

function toUniversityData(
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

    const rawUniversities = JSON.parse(universitiesJsonData) as unknown;

    const universities = universitiesSeedSchema
      .parse(rawUniversities)
      .map(toUniversityData);

    const upsertedUniversities = await prisma.$transaction(
      universities.map((data) =>
        prisma.university.upsert({
          where: { name: data.name },
          create: data,
          update: data,
        }),
      ),
    );

    // eslint-disable-next-line no-console
    console.log(
      `Upserted ${upsertedUniversities.length.toString()} universities.`,
    );

    // eslint-disable-next-line no-console
    console.log("Seeding faculties...");

    const rawFaculties = JSON.parse(facultiesJsonData) as unknown;

    const facultyGroups = facultiesSeedSchema.parse(rawFaculties);

    const universityIdByName = new Map(
      upsertedUniversities.map((university) => [
        university.name,
        university.id,
      ]),
    );

    const unknownUniversities = facultyGroups
      .map((group) => group.university)
      .filter((name) => !universityIdByName.has(name));

    if (unknownUniversities.length > 0) {
      throw new Error(
        `Unknown universities in faculties.json: ${unknownUniversities.join(", ")}`,
      );
    }

    const facultyUpserts = facultyGroups.flatMap((group) => {
      const universityId = universityIdByName.get(group.university);

      if (universityId === undefined) {
        throw new Error(
          `Unknown university in faculties.json: ${group.university}`,
        );
      }

      return group.faculties.map((faculty) =>
        prisma.faculty.upsert({
          where: {
            name_universityId: { name: faculty.name, universityId },
          },
          create: {
            name: faculty.name,
            universityId,
            city: faculty.city ?? null,
            website: faculty.website ?? null,
          },
          update: {
            city: faculty.city ?? null,
            website: faculty.website ?? null,
          },
        }),
      );
    });

    const upsertedFaculties = await prisma.$transaction(facultyUpserts);

    // eslint-disable-next-line no-console
    console.log(`Upserted ${upsertedFaculties.length.toString()} faculties.`);
  } catch (error: unknown) {
    console.error("Error seeding database:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

await main();
