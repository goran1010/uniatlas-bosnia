import "dotenv/config.js";
import pg from "pg";
import { execSync } from "child_process";
import path from "path";

const { Client } = pg;

export default async function () {
  process.env.NODE_ENV = "test";

  const adminUrl = new URL(process.env.TEST_DATABASE_URL);
  adminUrl.pathname = "/postgres";

  const templateDbName = `test_template_${Date.now()}`;
  const templateUrl = new URL(process.env.TEST_DATABASE_URL);
  templateUrl.pathname = `/${templateDbName}`;

  const client = new Client({ connectionString: adminUrl.toString() });
  await client.connect();
  await client.query(`CREATE DATABASE "${templateDbName}"`);
  await client.end();

  const backendRoot = path.resolve(import.meta.dirname, "../..");

  execSync("npx prisma migrate deploy", {
    cwd: backendRoot,
    env: { ...process.env, TEST_DATABASE_URL: templateUrl.toString() },
    stdio: "pipe",
  });

  process.env.TEST_DB_TEMPLATE = templateDbName;

  return async () => {
    const dropClient = new Client({ connectionString: adminUrl.toString() });
    await dropClient.connect();
    await dropClient.query(`DROP DATABASE "${templateDbName}" WITH (FORCE)`);
    await dropClient.end();
  };
}
