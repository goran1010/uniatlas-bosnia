import request from "supertest";
import { app } from "../../src/app.js";
import { describe, test, expect } from "vitest";

function getResponseObject(body: unknown): Record<string, unknown> {
  expect(body).toBeTypeOf("object");
  expect(body).not.toBeNull();

  return body as Record<string, unknown>;
}

describe("CSRF Router", () => {
  test("should return a CSRF token", async () => {
    const response = await request(app).get("/csrf-token");
    const responseBody = getResponseObject(response.body);

    expect(response.status).toBe(200);
    expect(responseBody["data"]).toBeTypeOf("string");
  });
});
