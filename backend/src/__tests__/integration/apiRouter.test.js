import request from "supertest";
import { app } from "../../src/app.js";
import { describe, test, expect } from "vitest";

describe("GET /api/", () => {
  test("responds with status 200 when LIVE", async () => {
    const response = await request(app).get("/api/");
    const expectedResponse = {
      status: 200,
      body: {
        data: {
          status: "ok",
        },
        message: "API server is running",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});
