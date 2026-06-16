import request from "supertest";
import { app } from "../../app.js";
import { describe, test, expect } from "vitest";
import { universitiesModel } from "../../models/universitiesModel.js";

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
