import request from "supertest";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { app } from "../../app.js";
import { pendingChangesPostalCodeModel } from "../../models/pendingChangesPostalCodeModel.js";
import { postalCodesModel } from "../../models/postalCodesModel.js";

let mockedUser = null;

vi.mock("../../auth/isAuthenticated.js", () => {
  return {
    isAuthenticated: (req, res, next) => {
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
  mockedUser = null;
});

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
      id: 1,
      username: "user1",
      email: "user1@example.com",
      role: "USER",
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
    vi.spyOn(pendingChangesPostalCodeModel, "findMany").mockResolvedValueOnce([
      {
        id: 1,
        city: "Pending City",
        code: 54321,
        post: "",
        typeOfChange: "DELETE",
      },
    ]);

    mockedUser = {
      id: 1,
      username: "admin1",
      email: "admin1@example.com",
      role: "ADMIN",
    };

    const response = await request(app).get("/users/admin/pending-changes");
    const expectedResponse = {
      status: 200,
      body: {
        message: "Pending changes retrieved successfully.",
        data: [
          {
            id: 1,
            city: "Pending City",
            code: 54321,
            post: "",
            typeOfChange: "DELETE",
          },
        ],
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
      id: 1,
      username: "user1",
      email: "user1@example.com",
      role: "USER",
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
    vi.spyOn(pendingChangesPostalCodeModel, "delete").mockResolvedValueOnce(
      "Successfully deleted pending change",
    );

    mockedUser = {
      id: 1,
      username: "admin1",
      email: "admin1@example.com",
      role: "ADMIN",
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
      id: 1,
      username: "user1",
      email: "user1@example.com",
      role: "USER",
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
      id: 1,
      username: "user1",
      email: "user1@example.com",
      role: "ADMIN",
    };

    vi.spyOn(pendingChangesPostalCodeModel, "findMany").mockResolvedValueOnce(
      [],
    );

    const response = await request(app)
      .post("/users/admin/approve-pending-change")
      .send({
        id: "a1b2c3d4-e5f6-4789-abcd-000000000999",
        typeOfChange: "CREATE",
      });
    const expectedResponse = {
      status: 404,
      body: expect.objectContaining({
        error: expect.stringContaining("Pending change not found"),
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("Responds with status 200 and message if pending change approved successfully", async () => {
    vi.spyOn(pendingChangesPostalCodeModel, "findMany").mockResolvedValueOnce([
      {
        id: "a1b2c3d4-e5f6-4789-abcd-000000000001",
        city: "Test City",
        code: 12345,
        post: "",
        typeOfChange: "CREATE",
      },
    ]);

    vi.spyOn(postalCodesModel, "createNew").mockResolvedValueOnce({
      id: 10,
      city: "Test City",
      code: 12345,
      post: "",
    });

    vi.spyOn(pendingChangesPostalCodeModel, "delete").mockResolvedValueOnce({
      count: 1,
    });

    mockedUser = {
      id: 1,
      username: "user1",
      email: "user1@example.com",
      role: "ADMIN",
    };

    const response = await request(app)
      .post("/users/admin/approve-pending-change")
      .send({
        id: "a1b2c3d4-e5f6-4789-abcd-000000000001",
        typeOfChange: "CREATE",
      });
    const expectedResponse = {
      status: 200,
      body: {
        data: null,
        message: "Pending change approved successfully.",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));

    expect(postalCodesModel.createNew).toHaveBeenCalledWith(
      "Test City",
      12345,
      "",
    );
    expect(pendingChangesPostalCodeModel.delete).toHaveBeenCalledWith({
      id: "a1b2c3d4-e5f6-4789-abcd-000000000001",
    });
  });
});
