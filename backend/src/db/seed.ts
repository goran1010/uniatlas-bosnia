/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "#generated/prisma/client.js";
import { DATABASE_URL, NODE_ENV, TEST_DATABASE_URL } from "../config/env.js";

const __dirname = import.meta.dirname;

const connectionString = NODE_ENV === "test" ? TEST_DATABASE_URL : DATABASE_URL;

if (!connectionString) {
  throw new Error("Database URL not found in environment variables.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const filePath = path.resolve(__dirname, "JSON_files/universities.json");
const JSONdata = fs.readFileSync(filePath, "utf-8");
const universities = JSON.parse(JSONdata);

const toDateTime = (val: string | null) =>
  val ? new Date(val).toISOString() : null;

interface University {
  name: string;
  acronym: string;
  city: string;
  entity: string;
  ownership: "Javna" | "Privatna";
  foundedYear: number;
  website: string;
  accreditationFrom: string | null;
  accreditationTo: string | null;
  authority: string;
  sourceUrl: string;
  lastChecked: string;
}

async function main() {
  console.log("Seeding universities...");

  const result = await prisma.university.createMany({
    data: universities.map((u: University) => ({
      name: u.name,
      acronym: u.acronym,
      city: u.city,
      entity: u.entity,
      ownership: u.ownership === "Javna" ? "JAVNA" : "PRIVATNA",
      foundedYear: u.foundedYear,
      website: u.website,
      accreditationFrom: toDateTime(u.accreditationFrom),
      accreditationTo: toDateTime(u.accreditationTo),
      authority: u.authority,
      sourceUrl: u.sourceUrl,
      lastChecked: toDateTime(u.lastChecked),
    })),
    skipDuplicates: true,
  });

  console.log(`Inserted ${result.count} new universities.`);
}

main()
  .catch((error) => {
    console.error("Error seeding universities:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
