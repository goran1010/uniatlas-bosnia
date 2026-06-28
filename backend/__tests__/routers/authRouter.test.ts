import { describe, test, expect, vi, beforeEach } from "vitest";
import request from "supertest";

import type { Request, Response, NextFunction } from "express";

vi.mock("../../src/config/sessionMiddleware.js", () => ({
  sessionMiddleware: (req: Request, _res: Response, next: NextFunction) => {
    const session = {
      cookie: {
        originalMaxAge: 1000 * 60 * 60 * 24,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        secure: false,
        httpOnly: true,
      },
      id: "test-session-id",
      destroy: vi.fn((callback?: (err?: unknown) => void) => {
        callback?.();
        return session;
      }),
      regenerate: vi.fn((callback?: (err?: unknown) => void) => {
        callback?.();
        return session;
      }),
      save: vi.fn((callback?: (err?: unknown) => void) => {
        callback?.();
        return session;
      }),
      reload: vi.fn((callback?: (err?: unknown) => void) => {
        callback?.();
        return session;
      }),
      resetMaxAge: vi.fn(),
      touch: vi.fn(),
    } as Request["session"];

    req.session = session;
    next();
  },
}));

import { app } from "../../src/app.js";
import { emailConfirmHTML } from "../../src/utils/emailConfirmHTML.js";
import { createNewUserInput } from "../utils/createNewUserInput.js";
import { usersModel } from "../../src/models/usersModel.js";
import { sendConfirmationEmail } from "../../src/email/confirmationEmail.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { pendingUserModel } from "../../src/models/pendingUsersModel.js";

const isAuthenticatedMock = vi.fn();

vi.mock("../../src/auth/isAuthenticated.js", () => ({
  isAuthenticated: (req: Request, res: Response, next: NextFunction) =>
    isAuthenticatedMock(req, res, next),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  // Set default behavior
  isAuthenticatedMock.mockImplementation((req, res, next) => {
    if (req.user) return next();
    res.status(403).json({ error: "You need to be logged in." });
  });
});

describe("POST /auth/signup", () => {
  test("responds with status 400 and message for incorrect password input", async () => {
    const newUser = createNewUserInput({
      password: "123",
      "confirm-password": "123",
    });

    const responseData = {
      error: {
        message:
          "Password must be at least 6 characters long and contain at least one number",
      },
    };

    const response = await request(app).post("/auth/signup").send(newUser);
    const expectedResponse = {
      status: 400,
      body: expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining(responseData.error.message),
        }),
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("responds with status 400 and message for incorrect confirm-password input", async () => {
    const newUser = createNewUserInput({
      "confirm-password": "123",
    });

    const responseData = {
      error: {
        message: "Passwords do not match",
      },
    };

    const response = await request(app).post("/auth/signup").send(newUser);
    const expectedResponse = {
      status: 400,
      body: expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining(responseData.error.message),
        }),
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("successfully create a user and returns status 201 and message", async () => {
    const newUser = createNewUserInput();

    vi.spyOn(usersModel, "findOne").mockResolvedValueOnce(null);
    vi.spyOn(pendingUserModel, "findMany").mockResolvedValueOnce([]);
    vi.spyOn(pendingUserModel, "create").mockResolvedValueOnce({
      id: "mock-pending-user-id",
      email: newUser.email,
      password: "hashed-password",
      token: "mock-token",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    vi.spyOn(usersModel, "create").mockResolvedValueOnce(newUser);

    const response = await request(app).post("/auth/signup").send(newUser);
    const expectedResponse = {
      status: 201,
      body: {
        data: expect.objectContaining({
          email: newUser.email,
        }),
        message: "Registration successful! Check your email.",
      },
    };

    expect(sendConfirmationEmail).toHaveBeenCalled();
    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("responds with generic 400 error if given email exists", async () => {
    const newUser = createNewUserInput();
    vi.spyOn(usersModel, "findOne").mockResolvedValueOnce({
      id: "existing-user-id",
      email: newUser.email,
      password: "hashed-password",
      role: "USER",
      githubId: null,
    });

    const responseData = {
      error: {
        message: "Signup failed: check your input and try again.",
      },
    };

    const response = await request(app).post("/auth/signup").send(newUser);
    const expectedResponse = {
      status: 400,
      body: expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining(responseData.error.message),
        }),
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});

describe("GET /auth/confirm/:token", () => {
  test("responds with status 404 and message for no token provided", async () => {
    const response = await request(app).get("/auth/confirm/");
    const expectedResponse = {
      status: 404,
      body: {
        error: {
          message: "Route not found: check the URL and HTTP method.",
        },
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("responds with status 400 and message for invalid token", async () => {
    vi.spyOn(console, "error").mockImplementation(() => vi.fn());
    vi.spyOn(pendingUserModel, "findMany").mockResolvedValueOnce([]);

    const response = await request(app).get("/auth/confirm/12345");
    const expectedResponse = {
      status: 400,
      body: {
        error: {
          message:
            "Email confirmation failed: token is invalid or expired. Request a new confirmation email.",
        },
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("responds with status 200 and HTML for valid token", async () => {
    vi.spyOn(pendingUserModel, "findMany").mockResolvedValueOnce([
      {
        id: "mock-pending-user-id",
        email: "test_user@example.com",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        password: "hashed-password",
        token: "mock-token",
      },
    ]);

    vi.spyOn(pendingUserModel, "delete").mockResolvedValueOnce({ count: 1 });
    vi.spyOn(usersModel, "create").mockResolvedValueOnce({
      id: "mock-user-id",
      email: "test_user@example.com",
      password: "hashed-password",
      role: "USER",
      githubId: null,
    });

    const token = crypto.randomBytes(32).toString("hex");

    vi.spyOn(usersModel, "findOne").mockResolvedValueOnce({
      id: "existing-user-id",
      email: "test_user@example.com",
      password: "hashed-password",
      role: "USER",
      githubId: null,
    });
    vi.spyOn(usersModel, "update").mockResolvedValueOnce({
      id: "existing-user-id",
      email: "test_user@example.com",
      password: "hashed-password",
      role: "USER",
      githubId: null,
    });

    const response = await request(app).get(`/auth/confirm/${token}`);
    const expectedResponse = {
      status: 200,
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
    expect(response.text).toContain(emailConfirmHTML());
  });
});

describe("POST /auth/login", () => {
  test("responds with Incorrect email for wrong input", async () => {
    const newUser = createNewUserInput();
    vi.spyOn(usersModel, "findOne").mockResolvedValueOnce(null);

    const responseData = {
      error: {
        message: "Incorrect email or password",
      },
    };

    const response = await request(app).post("/auth/login").send(newUser);
    const expectedResponse = {
      status: 401,
      body: expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining(responseData.error.message),
        }),
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("responds with User test_user logged in successfully for correct input", async () => {
    const newUser = createNewUserInput();

    vi.spyOn(usersModel, "findOne").mockResolvedValueOnce(newUser);
    vi.spyOn(bcrypt, "compare").mockImplementationOnce(async () => true);

    const response = await request(app).post("/auth/login").send(newUser);

    const expectedResponse = {
      status: 200,
      body: expect.objectContaining({
        message: "Logged in successfully",
      }),
    };
    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});
