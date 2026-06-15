import { vi, afterAll } from "vitest";
import pg from "pg";

const { Client } = pg;
const dbName = `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const _adminUrl = new URL(process.env.TEST_DATABASE_URL);
_adminUrl.pathname = "/postgres";
const _adminUrlStr = _adminUrl.toString();

const _createClient = new Client({ connectionString: _adminUrlStr });
await _createClient.connect();
await _createClient.query(
  `CREATE DATABASE "${dbName}" TEMPLATE "${process.env.TEST_DB_TEMPLATE}"`,
);
await _createClient.end();

const _testDbUrl = new URL(process.env.TEST_DATABASE_URL);
_testDbUrl.pathname = `/${dbName}`;
process.env.TEST_DATABASE_URL = _testDbUrl.toString();

afterAll(async () => {
  const { prisma } = await import("../../db/prisma.js");
  await prisma.$disconnect();

  const dropClient = new Client({ connectionString: _adminUrlStr });
  await dropClient.connect();
  await dropClient.query(`DROP DATABASE "${dbName}" WITH (FORCE)`);
  await dropClient.end();
});

vi.mock("../../email/confirmationEmail.js", () => ({
  sendConfirmationEmail: vi.fn(async () => {
    return { success: true };
  }),
}));

vi.mock("pino", () => {
  return {
    default: () => ({
      info: vi.fn(),
      error: vi.fn(),
    }),
  };
});

vi.mock("csrf-sync", () => {
  const originalModule = vi.importActual("csrf-sync");
  return {
    ...originalModule,
    csrfSync: () => {
      return {
        csrfSynchronisedProtection: (req, res, next) => {
          next();
        },
        generateToken: () => {
          return "mocked-csrf-token";
        },
      };
    },
  };
});
