import request from "supertest";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { usersModel } from "../../models/usersModel.js";
import { createNewUser } from "../utils/createNewUser.js";
import { app } from "../../app.js";
import { sanitizeUser } from "../../utils/sanitizeUser.js";

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

describe("GET /me", () => {
  test("responds with status 401 and You are not logged in if not logged in", async () => {
    const notLoggedInResponse = {
      error: "You are not logged in.",
      details: [{ msg: null }],
    };

    const response = await request(app).get("/users/me");

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.body).toEqual(notLoggedInResponse);
    expect(response.status).toBe(401);
  });

  test("responds with status 200 and user data if logged in", async () => {
    const user = createNewUser();
    mockedUser = user;
    const safeUser = sanitizeUser(user);

    const response = await request(app).get("/users/me");

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.body).toEqual({
      message: "User info retrieved",
      data: safeUser,
    });
    expect(response.status).toBe(200);
  });
});

describe("POST /logout", () => {
  test("responds User logged out successfully", async () => {
    const user = createNewUser();
    mockedUser = user;

    const response = await request(app).post("/users/logout");

    expect(response.body).toEqual({
      data: {
        success: true,
      },
      message: "User logged out successfully",
    });
    expect(response.status).toBe(200);
  });
});
