import request from "supertest";
import { app } from "../../src/app.js";
import { describe, test, expect } from "vitest";
import { prisma } from "../../src/db/prisma.js";

function getResponseObject(body: unknown): Record<string, unknown> {
  expect(body).toBeTypeOf("object");
  expect(body).not.toBeNull();

  return body as Record<string, unknown>;
}

function getResponseArray(value: unknown): Record<string, unknown>[] {
  expect(Array.isArray(value)).toBe(true);

  return value as Record<string, unknown>[];
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
  test("responds with status 200 and universities", async () => {
    const testUniversityName = "Test Integration University GET All";
    const existing = await prisma.university.findMany({
      where: { name: testUniversityName },
    });
    for (const u of existing) {
      await prisma.university.delete({ where: { id: u.id } });
    }

    const uniInDb = await prisma.university.create({
      data: {
        name: testUniversityName,
        city: "Sarajevo",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });

    const response = await request(app).get("/api/v1/universities");
    const responseBody = getResponseObject(response.body);
    const data = getResponseArray(responseBody["data"]);

    expect(response.status).toBe(200);
    expect(responseBody["message"]).toBe(
      "Universities retrieved successfully.",
    );
    expect(
      data.some(
        (university) =>
          university["name"] === uniInDb.name &&
          university["city"] === uniInDb.city,
      ),
    ).toBe(true);
    await prisma.university.delete({ where: { id: uniInDb.id } });
  });
});

describe("GET /api/v1/universities/search", () => {
  test("responds with status 200 and universities for searchTerm=TestSearchCity", async () => {
    const testUniversityName = "Test Integration University Search";
    const existing = await prisma.university.findMany({
      where: { name: testUniversityName },
    });
    for (const u of existing) {
      await prisma.university.delete({ where: { id: u.id } });
    }

    const uniInDb = await prisma.university.create({
      data: {
        name: testUniversityName,
        city: "TestSearchCity",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });

    const response = await request(app).get(
      "/api/v1/universities/search?searchTerm=TestSearchCity",
    );
    const responseBody = getResponseObject(response.body);
    const data = getResponseArray(responseBody["data"]);

    expect(response.status).toBe(200);
    expect(
      data.some(
        (university) =>
          university["name"] === uniInDb.name &&
          university["city"] === uniInDb.city,
      ),
    ).toBe(true);

    await prisma.university.delete({ where: { id: uniInDb.id } });
  });
});

describe("GET /api/v1/universities/:id", () => {
  test("responds with status 200 and a university by id", async () => {
    const uniInDb = await prisma.university.create({
      data: {
        name: "Test Integration University By ID",
        city: "Sarajevo",
        entity: "FBIH",
        ownership: "JAVNA",
        faculties: {
          create: {
            name: "Test Integration Faculty By ID",
            studyPrograms: {
              create: {
                name: "Test Integration Study Program By ID",
                cycle: "FIRST",
                subjects: {
                  create: {
                    name: "Test Integration Subject By ID",
                    type: "MANDATORY",
                  },
                },
              },
            },
          },
        },
      },
    });

    const response = await request(app).get(
      `/api/v1/universities/${String(uniInDb.id)}`,
    );
    const responseBody = getResponseObject(response.body);
    const data = getResponseObject(responseBody["data"]);

    expect(response.status).toBe(200);
    expect(responseBody["message"]).toBe("University retrieved successfully.");
    expect(data["id"]).toBe(uniInDb.id);
    expect(data["name"]).toBe(uniInDb.name);
    const faculties = getResponseArray(data["faculties"]);
    const studyPrograms = getResponseArray(faculties[0]?.["studyPrograms"]);
    const subjects = getResponseArray(studyPrograms[0]?.["subjects"]);

    expect(faculties[0]?.["name"]).toBe("Test Integration Faculty By ID");
    expect(studyPrograms[0]?.["name"]).toBe(
      "Test Integration Study Program By ID",
    );
    expect(subjects[0]?.["name"]).toBe("Test Integration Subject By ID");

    await prisma.subject.deleteMany({
      where: {
        studyProgram: {
          faculty: {
            universityId: uniInDb.id,
          },
        },
      },
    });
    await prisma.studyProgram.deleteMany({
      where: { faculty: { universityId: uniInDb.id } },
    });
    await prisma.faculty.deleteMany({ where: { universityId: uniInDb.id } });
    await prisma.university.delete({ where: { id: uniInDb.id } });
  });

  test("responds with status 400 for invalid university id", async () => {
    const response = await request(app).get(
      "/api/v1/universities/not-a-number",
    );
    const responseBody = getResponseObject(response.body);
    const error = getResponseObject(responseBody["error"]);

    expect(response.status).toBe(400);
    expect(error["message"]).toBeTypeOf("string");
    expect(error["message"]).toBe("Request validation failed.");
  });
});
