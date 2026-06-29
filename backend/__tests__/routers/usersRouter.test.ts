import request from "supertest";
import { describe, test, expect, vi, beforeEach } from "vitest";

import type { User } from "../../src/generated/prisma/client.js";
import type { Request, Response, NextFunction } from "express";

type ExpressUser = Omit<User, "password">;

vi.mock("../../src/config/sessionMiddleware.js", () => ({
  sessionMiddleware: (req: Request, _res: Response, next: NextFunction) => {
    req.session = {
      cookie: {
        originalMaxAge: 1000 * 60 * 60 * 24,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        secure: false,
        httpOnly: true,
      },
      id: "test-session-id",
      destroy: vi.fn(),
      regenerate: vi.fn(),
      save: vi.fn(),
      reload: vi.fn(),
      resetMaxAge: vi.fn(),
      touch: vi.fn(),
    };
    next();
  },
}));

import { app } from "../../src/app.js";

let mockedUser: ExpressUser | undefined = undefined;

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
