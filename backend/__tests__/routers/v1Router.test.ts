import request from "supertest";
import { app } from "../../src/app.js";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { universitiesModel } from "../../src/models/universitiesModel.js";
import type { University } from "#generated/prisma/client.js";

beforeEach(() => {
  vi.clearAllMocks();
});

const dummyData: { data: University[] } = {
  data: [
    {
      id: 1,
      name: "University of Sarajevo",
      city: "Sarajevo",
      acronym: "UNSA",
      entity: "FBIH",
      accreditationFrom: new Date("1949-01-01T00:00:00.000Z"),
      accreditationTo: new Date("2024-12-31T00:00:00.000Z"),
      authority:
        "Ministry of Education and Science of the Federation of Bosnia and Herzegovina",
      foundedYear: "1949",
      lastChecked: new Date("2024-01-01T00:00:00.000Z"),
      ownership: "JAVNA",
      sourceUrl: "https://www.unsa.ba/en/university",
      website: "https://www.unsa.ba/en",
    },
    {
      id: 2,
      name: "University of Banja Luka",
      city: "Banja Luka",
      acronym: "UNIBL",
      entity: "RS",
      accreditationFrom: new Date("1975-01-01T00:00:00.000Z"),
      accreditationTo: new Date("2024-12-31T00:00:00.000Z"),
      authority: "Ministry of Education and Culture of the Republika Srpska",
      foundedYear: "1975",
      lastChecked: new Date("2024-01-01T00:00:00.000Z"),
      ownership: "JAVNA",
      sourceUrl: "https://www.unibl.org/en/university",
      website: "https://www.unibl.org/en",
    },
  ],
};

vi.spyOn(universitiesModel, "getAll").mockResolvedValue(dummyData.data);
vi.spyOn(universitiesModel, "searchUniversities").mockImplementation((term) => {
  const lower = term.toLowerCase();

  return vi
    .fn()
    .mockResolvedValue(
      dummyData.data.filter(
        (u) =>
          u.name.toLowerCase().includes(lower) ||
          u.city.toLowerCase().includes(lower) ||
          (u.acronym && u.acronym.toLowerCase().includes(lower)),
      ),
    )();
});

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
  test("responds with status 200 and an array with dummy data", async () => {
    const response = await request(app).get("/api/v1/universities");
    const expectedResponse = {
      status: 200,
      body: {
        message: "Universities retrieved successfully.",
        data: dummyData.data,
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});

describe("GET /api/v1/universities/search", () => {
  test("responds with status 200 and universities for searchTerm=Sarajevo", async () => {
    const response = await request(app).get(
      "/api/v1/universities/search?searchTerm=Sarajevo",
    );

    const dummyDataFiltered = dummyData.data.filter(
      (u) => u.city === "Sarajevo",
    );
    const expectedResponse = {
      status: 200,
      body: expect.objectContaining({
        data: dummyDataFiltered,
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("responds with status 404 for searchTerm=non-existent-university", async () => {
    const response = await request(app).get(
      "/api/v1/universities/search?searchTerm=non-existent-university",
    );
    const expectedResponse = {
      status: 404,
      body: {
        error: {
          message: "No universities found matching your search.",
        },
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("responds with status 400 for missing searchTerm", async () => {
    const response = await request(app).get("/api/v1/universities/search");
    const expectedResponse = {
      status: 400,
      body: expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining("Search term is required"),
        }),
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});
