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

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "You are not logged in.",
      details: [{ msg: null }],
    });
  });

  test("Responds with You need to be admin to access this route if role USER", async () => {
    mockedUser = {
      id: 1,
      username: "user1",
      email: "user1@example.com",
      role: "USER",
    };

    const response = await request(app).get("/users/admin//pending-changes");

    expect(response.header["content-type"]).toMatch(/json/);

    expect(response.body).toEqual({
      error: {
        message: "Access denied: admin role is required.",
      },
    });
    expect(response.status).toBe(403);
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

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
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
    });
  });
});

describe("Admin Router - DELETE /decline-pending-change", () => {
  test("Responds with You need to be logged in and an admin to access this route if not logged in", async () => {
    const response = await request(app).delete(
      "/users/admin/decline-pending-change",
    );

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "You are not logged in.",
      details: [{ msg: null }],
    });
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

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: {
        message: "Access denied: admin role is required.",
      },
    });
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
      .send({ id: 1 });

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Pending change declined successfully.",
      data: null,
    });
  });
});

describe("Admin Router - POST /users/admin/approve-pending-change", () => {
  test("Responds with You need to be logged in and an admin to access this route if not logged in", async () => {
    const response = await request(app).post(
      "/users/admin/approve-pending-change",
    );

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "You are not logged in.",
      details: [{ msg: null }],
    });
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

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: {
        message: "Access denied: admin role is required.",
      },
    });
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
      .send({ id: 999, typeOfChange: "CREATE" });

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(404);
    expect(response.body.error).toContain("Pending change not found");
  });

  test("Responds with status 200 and message if pending change approved successfully", async () => {
    vi.spyOn(pendingChangesPostalCodeModel, "findMany").mockResolvedValueOnce([
      {
        id: 1,
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
      .send({ id: 1, typeOfChange: "CREATE" });

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: null,
      message: "Pending change approved successfully.",
    });

    expect(postalCodesModel.createNew).toHaveBeenCalledWith(
      "Test City",
      12345,
      "",
    );
    expect(pendingChangesPostalCodeModel.delete).toHaveBeenCalledWith({
      id: 1,
    });
  });
});
