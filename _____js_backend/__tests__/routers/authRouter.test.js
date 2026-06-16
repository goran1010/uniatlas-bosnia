import { describe, test, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../app.js";
import { emailConfirmHTML } from "../../utils/emailConfirmHTML.js";
import { createNewUser } from "../utils/createNewUser.js";
import { usersModel } from "../../models/usersModel.js";
import { sendConfirmationEmail } from "../../email/confirmationEmail.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sanitizeUser } from "../../utils/sanitizeUser.js";
import { pendingUserModel } from "../../models/pendingUsersModel.js";

const isAuthenticatedMock = vi.fn();

vi.mock("../../auth/isAuthenticated.js", () => ({
  isAuthenticated: (req, res, next) => isAuthenticatedMock(req, res, next),
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
  // Set default behavior
  isAuthenticatedMock.mockImplementation((req, res, next) => {
    if (req.user) return next();
    res.status(403).json({ error: "You need to be logged in." });
  });
});

describe("POST /auth/signup", () => {
  test("responds with status 400 and message for incorrect password input", async () => {
    const newUser = createNewUser({
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
    const newUser = createNewUser({
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
    const newUser = createNewUser();
    const createdUser = {
      id: "mock-user-id",
      email: newUser.email,
      isEmailConfirmed: false,
      role: "USER",
      requestedContributor: false,
      password: "hashed-password",
    };
    vi.spyOn(usersModel, "create").mockResolvedValueOnce(
      sanitizeUser(createdUser),
    );

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
    const newUser = createNewUser();
    vi.spyOn(usersModel, "findOne").mockResolvedValueOnce({
      email: newUser.email,
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
    vi.spyOn(console, "error").mockImplementation(() => {});

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
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // expires in 1 hour
      },
    ]);

    vi.spyOn(pendingUserModel, "delete").mockResolvedValueOnce(true);
    vi.spyOn(usersModel, "create").mockResolvedValueOnce({
      id: "mock-user-id",
      email: "test_user@example.com",
    });

    const token = crypto.randomBytes(32).toString("hex");

    vi.spyOn(usersModel, "findOne").mockResolvedValueOnce({
      isEmailConfirmed: false,
    });
    vi.spyOn(usersModel, "update").mockResolvedValueOnce(true);

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
    const newUser = createNewUser();

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
    const newUser = createNewUser({ isEmailConfirmed: true });

    vi.spyOn(usersModel, "findOne").mockResolvedValueOnce(newUser);
    vi.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);

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
