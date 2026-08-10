import request from "supertest";
import { app } from "../../src/app.js";
import { describe, test, expect } from "vitest";

describe("GET /health/", () => {
  test("responds with status 200 when healthy", async () => {
    const response = await request(app).get("/health/");
    const expectedResponse = {
      status: 200,
      body: {
        data: {
          status: "ok",
        },
        message: "Server is healthy",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});
