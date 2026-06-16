import { describe, test, expect } from "vitest";

describe("process.env variable missing or undefined", () => {
  test("envCheck should throw an error if process.env.FRONTEND_URL is missing", async () => {
    const { envCheck } = await import("../config/env.js");

    const validEnv = {
      DATABASE_URL: "postgres://database",
      FRONTEND_URL: undefined,
      BACKEND_URL: "http://localhost:3000",
      PORT: "3000",
      RESEND_API_KEY: "resend-key",
      COOKIE_SECRET: "cookie-secret",
      NODE_ENV: "test",
      GITHUB_CLIENT_ID: "github-client-id",
      GITHUB_CLIENT_SECRET: "github-client-secret",
      GITHUB_CALLBACK_URL: "http://localhost:3000/auth/github/callback",
      TEST_DATABASE_URL: "postgres://test-database",
    };

    expect(() => envCheck(validEnv)).toThrow(
      /Missing required environment variables?: FRONTEND_URL/i,
    );
  });
});
