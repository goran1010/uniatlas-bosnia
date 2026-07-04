import request from "supertest";
import { app } from "../../src/app.js";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../src/db/prisma.js";

import type { University } from "../../src/generated/prisma/client.js";

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
      accreditationFrom: null,
      accreditationTo: null,
      authority:
        "Ministry of Education and Science of the Federation of Bosnia and Herzegovina",
      foundedYear: "1949",
      lastChecked: null,
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
      accreditationFrom: null,
      accreditationTo: null,
      authority: "Ministry of Education and Culture of the Republika Srpska",
      foundedYear: "1975",
      lastChecked: null,
      ownership: "JAVNA",
      sourceUrl: "https://www.unibl.org/en/university",
      website: "https://www.unibl.org/en",
    },
  ],
};

vi.spyOn(prisma.university, "findUnique").mockImplementation(
  ({ where: { id } }) => {
    return vi
      .fn()
      .mockResolvedValue(
        dummyData.data.find((university) => university.id === id) ?? null,
      )();
  },
);

function mockUniversitySearch(
  args?: Parameters<typeof prisma.university.findMany>[0],
): ReturnType<typeof prisma.university.findMany> {
  const normalizedTerm =
    (
      args?.where as
        | {
            OR?: {
              name?: { contains?: string };
              city?: { contains?: string };
              acronym?: { contains?: string };
            }[];
          }
        | undefined
    )?.OR?.[0]?.name?.contains?.toLowerCase() ?? "";

  return Promise.resolve(
    dummyData.data.filter(
      (u) =>
        u.name.toLowerCase().includes(normalizedTerm) ||
        u.city.toLowerCase().includes(normalizedTerm) ||
        (u.acronym && u.acronym.toLowerCase().includes(normalizedTerm)),
    ),
  ) as ReturnType<typeof prisma.university.findMany>;
}

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
  vi.spyOn(prisma.university, "findMany").mockResolvedValue(dummyData.data);

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
    vi.spyOn(prisma.university, "findMany").mockImplementation(
      mockUniversitySearch,
    );
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

describe("GET /api/v1/universities/:id", () => {
  test("responds with status 200 and the requested university", async () => {
    const response = await request(app).get("/api/v1/universities/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "University retrieved successfully.",
        data: expect.objectContaining({
          id: 1,
          name: "University of Sarajevo",
        }),
      }),
    );
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
