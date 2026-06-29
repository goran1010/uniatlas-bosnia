import request from "supertest";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { pendingChangesModel } from "../../src/models/pendingChangesModel.js";
import { app } from "../../src/app.js";

import type { User } from "#generated/prisma/client.js";
import type { Request, Response, NextFunction } from "express";
import type { entityType, typeOfChange } from "#generated/prisma/client.js";
import type { JsonValue } from "@prisma/client/runtime/client";

let mockedUser: Omit<User, "password"> | undefined;

interface MockedResult {
  id: string;
  entityType: entityType;
  typeOfChange: typeOfChange;
  targetId: number | null;
  parentId: number | null;
  userId: string;
  createdAt: Date;
  reviewedAt: Date | null;
  data: JsonValue;
}

interface MockPendingChanges {
  entityType: entityType;
  targetId: number | null;
  data: JsonValue | null;
  id: string;
  typeOfChange: typeOfChange;
  parentId: number | null;
  createdAt: Date;
  reviewedAt: Date | null;
  userId: string;
  user: Omit<User, "password">;
}

vi.mock("../../src/auth/isAuthenticated.js", () => {
  return {
    isAuthenticated: (req: Request, res: Response, next: NextFunction) => {
      req.user = mockedUser;
      if (req.user) return next();

      res.status(401).json({
        error: "You are not logged in.",
        details: [{ msg: null }],
      });
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  mockedUser = undefined;
});

describe("POST /users/contribution/universities", () => {
  test("responds with status 401 and You need to be logged in to access this route if not logged in", async () => {
    const notLoggedInResponse = {
      error: "You are not logged in.",
      details: [{ msg: null }],
    };

    const response = await request(app).post(
      "/users/contribution/universities",
    );
    const expectedResponse = {
      status: 401,
      body: notLoggedInResponse,
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("No entityType sent responds with status 400 and Entity type is required", async () => {
    mockedUser = {
      id: "1",
      email: "user1@example.com",
      role: "USER",
      githubId: null,
    };
    const agent = request.agent(app);

    const expectedResponse = "Entity type is required";
    const response = await agent.post("/users/contribution/universities");
    const expectedResponseData = {
      status: 400,
      body: expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining(expectedResponse),
        }),
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponseData));
  });

  test("Valid request responds with status 201 and Suggestion submitted", async () => {
    const mockResult: MockedResult = {
      id: "uuid-1",
      entityType: "UNIVERSITY",
      typeOfChange: "CREATE",
      targetId: null,
      parentId: null,
      userId: "1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      reviewedAt: null,
      data: {
        name: "TestCity University",
        city: "TestCity",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    };
    vi.spyOn(pendingChangesModel, "create").mockResolvedValue(mockResult);

    mockedUser = {
      id: "1",
      email: "user1@example.com",
      role: "USER",
      githubId: null,
    };
    const agent = request.agent(app);

    const response = await agent.post("/users/contribution/universities").send({
      entityType: "UNIVERSITY",
      data: {
        name: "TestCity University",
        city: "TestCity",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });
    const expectedResponseData = {
      status: 201,
      body: {
        data: {
          ...mockResult,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
        message: "Suggestion submitted. An admin will review it.",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponseData));
  });

  test("Unsupported data fields respond with status 400", async () => {
    mockedUser = {
      id: "1",
      email: "user1@example.com",
      role: "USER",
      githubId: null,
    };
    const agent = request.agent(app);

    const response = await agent.post("/users/contribution/universities").send({
      entityType: "UNIVERSITY",
      data: {
        name: "TestCity University",
        city: "TestCity",
        entity: "FBIH",
        ownership: "JAVNA",
        ects: 240,
      },
    });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toContain(
      "Data contains unsupported fields for this entity type",
    );
  });
});

describe("PUT /users/contribution/universities", () => {
  test("responds with status 401 and You need to be logged in to access this route if not logged in", async () => {
    const notLoggedInResponse = {
      error: "You are not logged in.",
      details: [{ msg: null }],
    };

    const response = await request(app).put("/users/contribution/universities");
    const expectedResponse = {
      status: 401,
      body: notLoggedInResponse,
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("No entityType sent responds with status 400 and Entity type is required", async () => {
    mockedUser = {
      id: "1",
      email: "user1@example.com",
      role: "USER",
      githubId: null,
    };
    const agent = request.agent(app);

    const expectedResponse = "Entity type is required";
    const responseCode = await agent.put("/users/contribution/universities");
    const expectedResponseData = {
      status: 400,
      body: expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining(expectedResponse),
        }),
      }),
    };

    expect(responseCode).toEqual(expect.objectContaining(expectedResponseData));
  });

  test("Valid request responds with status 201 and Edit suggestion submitted", async () => {
    const mockResult: MockPendingChanges = {
      id: "uuid-2",
      entityType: "UNIVERSITY",
      typeOfChange: "UPDATE",
      targetId: 1,
      parentId: null,
      data: { name: "Updated Name" },
      userId: "1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      reviewedAt: null,
      user: {
        id: "1",
        email: "user1@example.com",
        role: "USER",
        githubId: null,
      },
    };
    vi.spyOn(pendingChangesModel, "create").mockResolvedValue(mockResult);

    mockedUser = {
      id: "1",
      email: "user1@example.com",
      role: "USER",
      githubId: null,
    };
    const agent = request.agent(app);

    const response = await agent.put("/users/contribution/universities").send({
      entityType: "UNIVERSITY",
      targetId: 1,
      data: { name: "Updated Name" },
    });
    const expectedResponseData = {
      status: 201,
      body: {
        message: "Edit suggestion submitted. An admin will review it.",
        data: {
          ...mockResult,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponseData));
  });
});

describe("DELETE /users/contribution/universities", () => {
  test("responds with status 401 and You need to be logged in to access this route if not logged in", async () => {
    const notLoggedInResponse = {
      error: "You are not logged in.",
      details: [{ msg: null }],
    };

    const response = await request(app).delete(
      "/users/contribution/universities",
    );
    const expectedResponse = {
      status: 401,
      body: notLoggedInResponse,
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("No entityType sent responds with status 400 and Entity type is required", async () => {
    mockedUser = {
      id: "1",
      email: "user1@example.com",
      role: "USER",
      githubId: null,
    };
    const agent = request.agent(app);

    const expectedResponse = "Entity type is required";
    const responseCode = await agent.delete("/users/contribution/universities");
    const expectedResponseData = {
      status: 400,
      body: expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining(expectedResponse),
        }),
      }),
    };

    expect(responseCode).toEqual(expect.objectContaining(expectedResponseData));
  });

  test("Valid request responds with status 201 and Deletion suggestion submitted", async () => {
    const mockResult: MockPendingChanges = {
      id: "uuid-3",
      entityType: "UNIVERSITY",
      typeOfChange: "DELETE",
      targetId: 1,
      parentId: null,
      data: {},
      userId: "1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      reviewedAt: null,
      user: {
        id: "1",
        email: "some@mail.com",
        role: "USER",
        githubId: null,
      },
    };
    vi.spyOn(pendingChangesModel, "create").mockResolvedValue(mockResult);

    const agent = request.agent(app);
    mockedUser = {
      id: "1",
      email: "user1@example.com",
      role: "USER",
      githubId: null,
    };

    const response = await agent
      .delete("/users/contribution/universities")
      .send({ entityType: "UNIVERSITY", targetId: 1 });
    const expectedResponseData = {
      status: 201,
      body: {
        message: "Deletion suggestion submitted. An admin will review it.",
        data: {
          ...mockResult,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponseData));
  });
});

describe("GET /users/contribution/pending-changes/universities", () => {
  test("responds with status 401 and You need to be logged in to access this route if not logged in", async () => {
    const notLoggedInResponse = {
      error: "You are not logged in.",
      details: [{ msg: null }],
    };

    const response = await request(app).get(
      "/users/contribution/pending-changes/universities",
    );
    const expectedResponse = {
      status: 401,
      body: notLoggedInResponse,
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("Valid request responds with status 200 and Pending changes retrieved successfully", async () => {
    const pendingChanges: MockPendingChanges[] = [
      {
        id: "uuid-1",
        userId: "1",
        entityType: "UNIVERSITY",
        typeOfChange: "CREATE",
        data: { name: "TestCity University" },
        targetId: 1,
        parentId: null,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        reviewedAt: null,
        user: {
          id: "1",
          email: "some@mail.com",
          role: "USER",
          githubId: null,
        },
      },
    ];

    vi.spyOn(pendingChangesModel, "findMany").mockResolvedValue(pendingChanges);

    mockedUser = {
      id: "1",
      email: "user1@example.com",
      role: "USER",
      githubId: null,
    };
    const agent = request.agent(app);

    const expectedResponse = {
      message: "Pending changes retrieved successfully.",
      data: pendingChanges.map((change) => ({
        ...change,
        createdAt: change.createdAt.toISOString(),
      })),
    };

    const response = await agent.get(
      "/users/contribution/pending-changes/universities",
    );
    const expectedResponseData = {
      status: 200,
      body: expectedResponse,
    };

    expect(response).toEqual(expect.objectContaining(expectedResponseData));
  });
});

describe("DELETE /users/contribution/pending-changes/universities", () => {
  test("responds with status 401 and You need to be logged in to access this route if not logged in", async () => {
    const notLoggedInResponse = {
      error: "You are not logged in.",
      details: [{ msg: null }],
    };

    const response = await request(app).delete(
      "/users/contribution/pending-changes/universities",
    );
    const expectedResponse = {
      status: 401,
      body: notLoggedInResponse,
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("Valid request responds with status 200 and Pending change deleted successfully", async () => {
    const pendingChange: MockPendingChanges = {
      id: "4e7d6077-6b57-48d1-a113-686731b5137e",
      userId: "4e7d6077-6b57-48d1-a113-686731b5137e",
      entityType: "UNIVERSITY",
      typeOfChange: "CREATE",
      data: { name: "TestCity University" },
      targetId: 1,
      parentId: null,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      reviewedAt: null,
      user: {
        id: "4e7d6077-6b57-48d1-a113-686731b5137e",
        email: "some@mail.com",
        role: "ADMIN",
        githubId: null,
      },
    };

    vi.spyOn(pendingChangesModel, "findMany").mockResolvedValue([
      pendingChange,
    ]);
    vi.spyOn(pendingChangesModel, "delete").mockResolvedValue(pendingChange);

    mockedUser = {
      id: "4e7d6077-6b57-48d1-a113-686731b5137e",
      email: "user1@example.com",
      role: "ADMIN",
      githubId: null,
    };
    const agent = request.agent(app);

    const response = await agent
      .delete("/users/contribution/pending-changes/universities")
      .send({ id: pendingChange.id });

    const expectedResponse = {
      status: 200,
      body: {
        message: "Pending change deleted successfully.",
        data: null,
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});
