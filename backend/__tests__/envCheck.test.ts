import { describe, test, expect, vi } from "vitest";

describe("process.env variable missing or undefined", () => {
  test("envCheck should throw an error if process.env.DATABASE_URL is missing", async () => {
    const originalDatabaseUrl = process.env["DATABASE_URL"];

    delete process.env["DATABASE_URL"];
    vi.resetModules();

    await expect(import("../src/config/env.js")).rejects.toThrow(
      "Missing environment variable: DATABASE_URL",
    );

    process.env["DATABASE_URL"] = originalDatabaseUrl;
    vi.resetModules();
  });
});
