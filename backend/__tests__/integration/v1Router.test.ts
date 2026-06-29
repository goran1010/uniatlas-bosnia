import request from "supertest";
import { app } from "../../src/app.js";
import { describe, test, expect } from "vitest";
import { universitiesModel } from "../../src/models/universitiesModel.js";

describe("GET /", () => {
  test("responds with status 200 when LIVE", async () => {
    const response = await request(app).get("/api/v1/");
    const expectedResponse = {
      status: 200,
      body: {
        data: {
          status: "ok",
        },
        message: "API v1 server is running",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});

describe("GET /api/v1/universities", () => {
  test("responds with status 200 and universities", async () => {
    const testUniversityName = "Test Integration University GET All";
    const existing =
      await universitiesModel.searchUniversities(testUniversityName);
    for (const u of existing) {
      await universitiesModel.deleteUniversity(u.id);
    }

    const uniInDb = await universitiesModel.createUniversity({
      name: testUniversityName,
      city: "Sarajevo",
      entity: "FBIH",
      ownership: "JAVNA",
    });

    const response = await request(app).get("/api/v1/universities");
    const expectedResponse = {
      status: 200,
      body: {
        message: "Universities retrieved successfully.",
        data: expect.arrayContaining([
          expect.objectContaining({
            name: uniInDb.name,
            city: uniInDb.city,
          }),
        ]),
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
    await universitiesModel.deleteUniversity(uniInDb.id);
  });
});

describe("GET /api/v1/universities/search", () => {
  test("responds with status 200 and universities for searchTerm=TestSearchCity", async () => {
    const testUniversityName = "Test Integration University Search";
    const existing =
      await universitiesModel.searchUniversities(testUniversityName);
    for (const u of existing) {
      await universitiesModel.deleteUniversity(u.id);
    }

    const uniInDb = await universitiesModel.createUniversity({
      name: testUniversityName,
      city: "TestSearchCity",
      entity: "FBIH",
      ownership: "JAVNA",
    });

    const response = await request(app).get(
      "/api/v1/universities/search?searchTerm=TestSearchCity",
    );
    const expectedResponse = {
      status: 200,
      body: expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            name: uniInDb.name,
            city: uniInDb.city,
          }),
        ]),
      }),
    };
    expect(response).toEqual(expect.objectContaining(expectedResponse));

    await universitiesModel.deleteUniversity(uniInDb.id);
  });
});

describe("GET /api/v1/universities/:id", () => {
  test("responds with status 200 and a university by id", async () => {
    const uniInDb = await universitiesModel.createUniversity({
      name: "Test Integration University By ID",
      city: "Sarajevo",
      entity: "FBIH",
      ownership: "JAVNA",
    });

    const response = await request(app).get(
      `/api/v1/universities/${uniInDb.id}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "University retrieved successfully.",
        data: expect.objectContaining({
          id: uniInDb.id,
          name: uniInDb.name,
        }),
      }),
    );

    await universitiesModel.deleteUniversity(uniInDb.id);
  });

  test("responds with status 400 for invalid university id", async () => {
    const response = await request(app).get(
      "/api/v1/universities/not-a-number",
    );

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining("Invalid university ID."),
        }),
      }),
    );
  });
});
