import request from "supertest";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { createNewUserInput } from "../utils/createNewUserInput";

vi.mock("../../src/config/sessionMiddleware.js", () => ({
  sessionMiddleware: (req, _res, next) => {
    req.session ??= {};
    req.session.destroy ??= (done) => done?.(null);
    req.session.regenerate ??= (done) => done?.(null);
    req.session.save ??= (done) => done?.(null);
    next();
  },
}));

import { app } from "../../src/app.js";

let mockedUser = null;

vi.mock("../../src/auth/isAuthenticated.js", () => {
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
      message: "No user logged in",
      data: null,
    };

    const response = await request(app).get("/users/me");
    const expectedResponse = {
      status: 200,
      body: notLoggedInResponse,
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});

describe("POST /logout", () => {
  test("responds User logged out successfully", async () => {
    const user = createNewUserInput();
    mockedUser = user;

    const response = await request(app).post("/users/logout");
    const expectedResponse = {
      status: 200,
      body: {
        data: {
          success: true,
        },
        message: "User logged out successfully",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});
