import request from "supertest";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { app } from "../../src/app.js";
import { pendingChangesModel } from "../../src/models/pendingChangesModel.js";
import { transactionModel } from "../../src/models/transactionModel.js";

import type {
  User,
  entityType,
  typeOfChange,
} from "#generated/prisma/client.js";
import type { Request, Response, NextFunction } from "express";
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

function mockTransactionWrapper(result = true) {
  return vi
    .spyOn(transactionModel, "approveUniversityPendingChange")
    .mockResolvedValue(result);
}

describe("Admin Router - GET /users/admin//pending-changes", () => {
  test("Responds with You need to be logged in and an admin to access this route if not logged in", async () => {
    const response = await request(app).get("/users/admin/pending-changes");
    const expectedResponse = {
      status: 401,
      body: {
        error: "You are not logged in.",
        details: [{ msg: null }],
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("Responds with You need to be admin to access this route if role USER", async () => {
    mockedUser = {
      id: "1",
      email: "user1@example.com",
      role: "USER",
      githubId: null,
    };

    const response = await request(app).get("/users/admin//pending-changes");
    const expectedResponse = {
      status: 403,
      body: {
        error: {
          message: "Access denied: admin role is required.",
        },
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("Responds with status 200 and all pending changes if role ADMIN", async () => {
    const mockPendingChanges: MockedResult[] = [
      {
        id: "a1b2c3d4-e5f6-4789-abcd-000000000001",
        entityType: "UNIVERSITY",
        typeOfChange: "DELETE",
        targetId: 1,
        parentId: null,
        userId: "1",
        createdAt: new Date(),
        reviewedAt: null,
        data: {},
        user: {
          id: "1",
          email: "admin1@example.com",
          role: "ADMIN",
          githubId: null,
        },
      },
    ];
    vi.spyOn(pendingChangesModel, "findMany").mockResolvedValueOnce(
      mockPendingChanges,
    );

    mockedUser = {
      id: "1",
      email: "admin1@example.com",
      role: "ADMIN",
      githubId: null,
    };

    const response = await request(app).get("/users/admin/pending-changes");
    const expectedResponse = {
      status: 200,
      body: {
        message: "Pending changes retrieved successfully.",
        data: mockPendingChanges.map((change) => ({
          ...change,
          createdAt: change.createdAt.toISOString(),
          reviewedAt: change.reviewedAt
            ? change.reviewedAt.toISOString()
            : null,
        })),
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});

describe("Admin Router - DELETE /decline-pending-change", () => {
  test("Responds with You need to be logged in and an admin to access this route if not logged in", async () => {
    const response = await request(app).delete(
      "/users/admin/decline-pending-change",
    );
    const expectedResponse = {
      status: 401,
      body: {
        error: "You are not logged in.",
        details: [{ msg: null }],
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("Responds with You need to be admin to access this route if role USER", async () => {
    mockedUser = {
      id: "1",
      email: "user1@example.com",
      role: "USER",
      githubId: null,
    };

    const response = await request(app).delete(
      "/users/admin/decline-pending-change",
    );
    const expectedResponse = {
      status: 403,
      body: {
        error: {
          message: "Access denied: admin role is required.",
        },
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("Responds with status 200 and all pending changes if role ADMIN", async () => {
    const mockPendingChanges: MockedResult = {
      id: "a1b2c3d4-e5f6-4789-abcd-000000000001",
      entityType: "UNIVERSITY",
      typeOfChange: "DELETE",
      targetId: 1,
      parentId: null,
      userId: "1",
      createdAt: new Date(),
      reviewedAt: null,
      data: {},
      user: {
        id: "1",
        email: "admin1@example.com",
        role: "ADMIN",
        githubId: null,
      },
    };
    vi.spyOn(pendingChangesModel, "delete").mockResolvedValueOnce(
      mockPendingChanges,
    );

    mockedUser = {
      id: "1",
      email: "admin1@example.com",
      role: "ADMIN",
      githubId: null,
    };

    const response = await request(app)
      .delete("/users/admin/decline-pending-change")
      .send({ id: "a1b2c3d4-e5f6-4789-abcd-000000000001" });
    const expectedResponse = {
      status: 200,
      body: {
        message: "Pending change declined successfully.",
        data: null,
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});

describe("Admin Router - POST /users/admin/approve-pending-change", () => {
  test("Responds with You need to be logged in and an admin to access this route if not logged in", async () => {
    const response = await request(app).post(
      "/users/admin/approve-pending-change",
    );
    const expectedResponse = {
      status: 401,
      body: {
        error: "You are not logged in.",
        details: [{ msg: null }],
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("Responds with You need to be admin to access this route if role USER", async () => {
    mockedUser = {
      id: "1",
      email: "user1@example.com",
      role: "USER",
      githubId: null,
    };

    const response = await request(app).post(
      "/users/admin/approve-pending-change",
    );
    const expectedResponse = {
      status: 403,
      body: {
        error: {
          message: "Access denied: admin role is required.",
        },
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("Responds with status 404 and Pending change not found if no valid id is provided", async () => {
    mockedUser = {
      id: "1",
      email: "user1@example.com",
      role: "ADMIN",
      githubId: null,
    };

    mockTransactionWrapper(false);

    const response = await request(app)
      .post("/users/admin/approve-pending-change")
      .send({
        id: "a1b2c3d4-e5f6-4789-abcd-000000000999",
      });
    const expectedResponse = {
      status: 404,
      body: expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining("Pending change not found"),
        }),
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("Responds with status 200 and message if pending change approved successfully", async () => {
    mockTransactionWrapper(true);

    mockedUser = {
      id: "1",
      email: "user1@example.com",
      role: "ADMIN",
      githubId: null,
    };

    const response = await request(app)
      .post("/users/admin/approve-pending-change")
      .send({
        id: "a1b2c3d4-e5f6-4789-abcd-000000000001",
      });
    const expectedResponse = {
      status: 200,
      body: {
        data: null,
        message: "Pending change approved successfully.",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
    expect(
      transactionModel.approveUniversityPendingChange,
    ).toHaveBeenCalledWith({
      id: "a1b2c3d4-e5f6-4789-abcd-000000000001",
    });
  });
});
