import { describe, test, expect, vi, beforeEach } from "vitest";
import request from "supertest";

beforeEach(() => {
  vi.resetModules();
});

describe("app", () => {
  test("app should be defined", async () => {
    const { app } = await import("../src/app.js");
    expect(app).toBeDefined();
  });

  test("app responds with status 500 if an unexpected error occurs", async () => {
    vi.doMock("../src/utils/rateLimiter.js", () => ({
      global: vi.fn((req, res, next) => next()),
      api: vi.fn(() => {
        throw new Error("Unexpected error");
      }),
      auth: vi.fn(),
      users: vi.fn(),
    }));
    const { app } = await import("../src/app.js");

    const response = await request(app).get("/api");
    const expectedResponse = {
      status: 500,
      body: {
        error: {
          message: "Server error: please try again later.",
        },
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("app responds with status 404 for unknown routes", async () => {
    const { app } = await import("../src/app.js");

    const response = await request(app).get("/unknown-route");
    const expectedResponse = {
      status: 404,
      body: {
        error: {
          message: "Route not found: check the URL and HTTP method.",
        },
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});
