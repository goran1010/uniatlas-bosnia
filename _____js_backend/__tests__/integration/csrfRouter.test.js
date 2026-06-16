import request from "supertest";
import { app } from "../../app.js";
import { describe, test, expect } from "vitest";

describe("CSRF Router", () => {
  test("should return a CSRF token", async () => {
    const response = await request(app).get("/csrf-token");
    const expectedResponse = {
      status: 200,
      body: expect.objectContaining({
        data: expect.any(String),
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});
