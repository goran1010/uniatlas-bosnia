import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

const {
  matchedDataMock,
  randomBytesMock,
  bcryptHashMock,
  sendConfirmationEmailMock,
  emailConfirmHTMLMock,
  userFindUniqueMock,
  userCreateMock,
  pendingUserFindManyMock,
  pendingUserUpdateManyMock,
  pendingUserCreateMock,
  pendingUserDeleteManyMock,
  pendingUserDeleteMock,
  disconnectMock,
  authenticateMock,
} = vi.hoisted(() => ({
  matchedDataMock: vi.fn(),
  randomBytesMock: vi.fn(),
  bcryptHashMock: vi.fn(),
  sendConfirmationEmailMock: vi.fn(),
  emailConfirmHTMLMock: vi.fn(),
  userFindUniqueMock: vi.fn(),
  userCreateMock: vi.fn(),
  pendingUserFindManyMock: vi.fn(),
  pendingUserUpdateManyMock: vi.fn(),
  pendingUserCreateMock: vi.fn(),
  pendingUserDeleteManyMock: vi.fn(),
  pendingUserDeleteMock: vi.fn(),
  disconnectMock: vi.fn(),
  authenticateMock: vi.fn(),
}));

vi.mock("express-validator", () => ({
  matchedData: matchedDataMock,
}));

vi.mock("crypto", () => ({
  default: {
    randomBytes: randomBytesMock,
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: bcryptHashMock,
  },
}));

vi.mock("../../../src/email/confirmationEmail.js", () => ({
  sendConfirmationEmail: sendConfirmationEmailMock,
}));

vi.mock("../../../src/utils/emailConfirmHTML.js", () => ({
  emailConfirmHTML: emailConfirmHTMLMock,
}));

vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    $disconnect: disconnectMock,
    user: {
      findUnique: userFindUniqueMock,
      create: userCreateMock,
    },
    pendingUser: {
      findMany: pendingUserFindManyMock,
      updateMany: pendingUserUpdateManyMock,
      create: pendingUserCreateMock,
      deleteMany: pendingUserDeleteManyMock,
      delete: pendingUserDeleteMock,
    },
  },
}));

vi.mock("../../../src/config/passport.js", () => ({
  passport: {
    authenticate: authenticateMock,
  },
}));

import { authController } from "../../../src/controllers/authController.js";
import { env } from "../../../src/config/env.js";

import type { Request, Response } from "express";

interface PendingUserRecord {
  id: string;
  email: string;
  password: string;
  token: string;
  expiresAt: Date;
}

function createMockResponse() {
  const statusMock = vi.fn().mockReturnThis();
  const jsonMock = vi.fn();
  const sendMock = vi.fn();
  const redirectMock = vi.fn();

  const res = {
    status: statusMock,
    json: jsonMock,
    send: sendMock,
    redirect: redirectMock,
  } as unknown as Response;

  return { res, statusMock, jsonMock, sendMock, redirectMock };
}

describe("authController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    disconnectMock.mockResolvedValue(undefined);
    randomBytesMock.mockReturnValue({
      toString: vi.fn().mockReturnValue("confirmation-token"),
    });
    bcryptHashMock.mockResolvedValue("hashed-password");
    sendConfirmationEmailMock.mockResolvedValue({ success: true });
    emailConfirmHTMLMock.mockReturnValue("<html>confirmed</html>");
    authenticateMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("signup updates an existing pending user before sending confirmation email", async () => {
    const req = {} as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    matchedDataMock.mockReturnValue({
      email: "user@example.com",
      password: "password123",
    });
    userFindUniqueMock.mockResolvedValue(null);
    pendingUserFindManyMock.mockResolvedValue([
      {
        id: "pending-user-1",
        email: "user@example.com",
      },
    ]);
    pendingUserUpdateManyMock.mockResolvedValue({ count: 1 });

    await authController.signup(req, res);

    const updatePayload = pendingUserUpdateManyMock.mock.calls[0]?.[0] as {
      where: { email: string };
      data: { password: string; token: string };
    };

    expect(updatePayload.where).toEqual({ email: "user@example.com" });
    expect(updatePayload.data.password).toBe("hashed-password");
    expect(updatePayload.data.token).toBe("confirmation-token");
    expect(pendingUserCreateMock).not.toHaveBeenCalled();
    expect(sendConfirmationEmailMock).toHaveBeenCalledWith(
      "user@example.com",
      `${env.BACKEND_URL}/auth/confirm/confirmation-token`,
    );
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith({
      data: { email: "user@example.com" },
      message: "Registration successful! Check your email.",
    });
  });

  test("signup responds with status 500 when confirmation email sending fails", async () => {
    const req = {} as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    matchedDataMock.mockReturnValue({
      email: "user@example.com",
      password: "password123",
    });
    userFindUniqueMock.mockResolvedValue(null);
    pendingUserFindManyMock.mockResolvedValue([]);
    pendingUserCreateMock.mockResolvedValue({ id: "pending-user-1" });
    sendConfirmationEmailMock.mockResolvedValue({ success: false });
    pendingUserDeleteManyMock.mockResolvedValue({ count: 1 });

    await authController.signup(req, res);

    expect(pendingUserDeleteManyMock).toHaveBeenCalledWith({
      where: { email: "user@example.com" },
    });
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message:
          "Signup failed: confirmation email was not sent. Check your email address and try again.",
      },
    });
  });

  test("signup responds with status 400 when an unexpected error is thrown", async () => {
    const failure = new Error("hash failed");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const req = {} as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    matchedDataMock.mockReturnValue({
      email: "user@example.com",
      password: "password123",
    });
    userFindUniqueMock.mockResolvedValue(null);
    bcryptHashMock.mockRejectedValue(failure);

    await authController.signup(req, res);

    expect(consoleErrorSpy).toHaveBeenCalledWith(failure);
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message: "Signup failed: check your input and try again.",
      },
    });
  });

  test("confirmEmail responds with status 400 when token is missing", async () => {
    const req = {} as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    matchedDataMock.mockReturnValue({});

    await authController.confirmEmail(req, res);

    expect(pendingUserFindManyMock).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message:
          "Email confirmation failed: token is invalid or expired. Request a new confirmation email.",
      },
    });
  });

  test("confirmEmail responds with status 400 and deletes expired pending users", async () => {
    const expiredPendingUser: PendingUserRecord = {
      id: "pending-user-1",
      email: "user@example.com",
      password: "hashed-password",
      token: "expired-token",
      expiresAt: new Date(Date.now() - 60 * 1000),
    };
    const req = {} as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    matchedDataMock.mockReturnValue({ token: "expired-token" });
    pendingUserFindManyMock.mockResolvedValue([expiredPendingUser]);
    pendingUserDeleteMock.mockResolvedValue(expiredPendingUser);

    await authController.confirmEmail(req, res);

    expect(pendingUserDeleteMock).toHaveBeenCalledWith({
      where: { id: expiredPendingUser.id },
    });
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message: "Token expired. Please sign up again.",
      },
    });
  });

  test("confirmEmail responds with status 500 when confirmation processing fails", async () => {
    const failure = new Error("create failed");
    const pendingUser: PendingUserRecord = {
      id: "pending-user-1",
      email: "user@example.com",
      password: "hashed-password",
      token: "valid-token",
      expiresAt: new Date(Date.now() + 60 * 1000),
    };
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const req = {} as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    matchedDataMock.mockReturnValue({ token: "valid-token" });
    pendingUserFindManyMock.mockResolvedValue([pendingUser]);
    userCreateMock.mockRejectedValue(failure);

    await authController.confirmEmail(req, res);

    expect(consoleErrorSpy).toHaveBeenCalledWith(failure);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message:
          "Email confirmation failed: token is invalid or expired. Request a new confirmation email.",
      },
    });
  });

  test("login passes passport authentication errors to next", () => {
    const authError = new Error("auth failed");
    const req = {
      session: {
        regenerate: vi.fn(),
      },
      logIn: vi.fn(),
    } as unknown as Request;
    const { res } = createMockResponse();
    const next = vi.fn();

    authenticateMock.mockImplementation(
      (
        _strategy: string,
        callback?: (
          err: unknown,
          user: Express.User | false | null,
          info?: { message?: string },
        ) => void,
      ) => {
        return () => {
          callback?.(authError, null, undefined);
        };
      },
    );

    authController.login(req, res, next);

    expect(next).toHaveBeenCalledWith(authError);
  });

  test("login uses the default invalid-credentials message when passport provides no info", () => {
    const req = {
      session: {
        regenerate: vi.fn(),
      },
      logIn: vi.fn(),
    } as unknown as Request;
    const { res, statusMock, jsonMock } = createMockResponse();
    const next = vi.fn();

    authenticateMock.mockImplementation(
      (
        _strategy: string,
        callback?: (
          err: unknown,
          user: Express.User | false | null,
          info?: { message?: string },
        ) => void,
      ) => {
        return () => {
          callback?.(null, null, undefined);
        };
      },
    );

    authController.login(req, res, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message:
          "Login failed: Invalid email or password. Check your credentials and try again.",
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("login passes req.logIn errors to next after session regeneration", () => {
    const loginError = new Error("login failed");
    const req = {
      session: {
        regenerate: vi.fn((callback: (err: Error | null) => void) => {
          callback(null);
        }),
      },
      logIn: vi.fn(
        (_user: Express.User, callback: (err: Error | null) => void) => {
          callback(loginError);
        },
      ),
    } as unknown as Request;
    const { res } = createMockResponse();
    const next = vi.fn();
    const user = { id: "1", email: "user@example.com" } as Express.User;

    authenticateMock.mockImplementation(
      (
        _strategy: string,
        callback?: (
          err: unknown,
          user: Express.User | false | null,
          info?: { message?: string },
        ) => void,
      ) => {
        return () => {
          callback?.(null, user, undefined);
        };
      },
    );

    authController.login(req, res, next);

    expect(next).toHaveBeenCalledWith(loginError);
  });

  test("login passes session regeneration errors to next", () => {
    const regenerateError = new Error("regenerate failed");
    const req = {
      session: {
        regenerate: vi.fn((callback: (err: Error | null) => void) => {
          callback(regenerateError);
        }),
      },
      logIn: vi.fn(),
    } as unknown as Request;
    const { res } = createMockResponse();
    const next = vi.fn();
    const user = { id: "1", email: "user@example.com" } as Express.User;

    authenticateMock.mockImplementation(
      (
        _strategy: string,
        callback?: (
          err: unknown,
          user: Express.User | false | null,
          info?: { message?: string },
        ) => void,
      ) => {
        return () => {
          callback?.(null, user, undefined);
        };
      },
    );

    authController.login(req, res, next);

    expect(next).toHaveBeenCalledWith(regenerateError);
  });

  test("githubLogin delegates to passport github authentication with user email scope", () => {
    const req = {} as Request;
    const { res } = createMockResponse();
    const next = vi.fn();
    const handler = vi.fn();

    authenticateMock.mockReturnValue(handler);

    authController.githubLogin(req, res, next);

    expect(authenticateMock).toHaveBeenCalledWith("github", {
      scope: ["user:email"],
    });
    expect(handler).toHaveBeenCalledWith(req, res, next);
  });

  test("githubCallback passes passport authentication errors to next", () => {
    const authError = new Error("github auth failed");
    const req = {
      session: {
        regenerate: vi.fn(),
        save: vi.fn(),
      },
      logIn: vi.fn(),
    } as unknown as Request;
    const { res } = createMockResponse();
    const next = vi.fn();

    authenticateMock.mockImplementation(
      (
        _strategy: string,
        callback?: (err: unknown, user: Express.User | false | null) => void,
      ) => {
        return () => {
          callback?.(authError, null);
        };
      },
    );

    authController.githubCallback(req, res, next);

    expect(next).toHaveBeenCalledWith(authError);
  });

  test("githubCallback redirects to login when passport returns no user", () => {
    const req = {
      session: {
        regenerate: vi.fn(),
        save: vi.fn(),
      },
      logIn: vi.fn(),
    } as unknown as Request;
    const { res, redirectMock } = createMockResponse();
    const next = vi.fn();

    authenticateMock.mockImplementation(
      (
        _strategy: string,
        callback?: (err: unknown, user: Express.User | false | null) => void,
      ) => {
        return () => {
          callback?.(null, null);
        };
      },
    );

    authController.githubCallback(req, res, next);

    expect(redirectMock).toHaveBeenCalledWith(
      `${env.FRONTEND_URL}/login?error=github`,
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("githubCallback passes req.logIn errors to next", () => {
    const loginError = new Error("github login failed");
    const user = { id: "1", email: "user@example.com" } as Express.User;
    const req = {
      session: {
        regenerate: vi.fn((callback: (err: Error | null) => void) => {
          callback(null);
        }),
        save: vi.fn(),
      },
      logIn: vi.fn(
        (_user: Express.User, callback: (err: Error | null) => void) => {
          callback(loginError);
        },
      ),
    } as unknown as Request;
    const { res } = createMockResponse();
    const next = vi.fn();

    authenticateMock.mockImplementation(
      (
        _strategy: string,
        callback?: (err: unknown, user: Express.User | false | null) => void,
      ) => {
        return () => {
          callback?.(null, user);
        };
      },
    );

    authController.githubCallback(req, res, next);

    expect(next).toHaveBeenCalledWith(loginError);
  });

  test("githubCallback passes session save errors to next", () => {
    const saveError = new Error("save failed");
    const user = { id: "1", email: "user@example.com" } as Express.User;
    const req = {
      session: {
        regenerate: vi.fn((callback: (err: Error | null) => void) => {
          callback(null);
        }),
        save: vi.fn((callback: (err: Error | null) => void) => {
          callback(saveError);
        }),
      },
      logIn: vi.fn(
        (_user: Express.User, callback: (err: Error | null) => void) => {
          callback(null);
        },
      ),
    } as unknown as Request;
    const { res } = createMockResponse();
    const next = vi.fn();

    authenticateMock.mockImplementation(
      (
        _strategy: string,
        callback?: (err: unknown, user: Express.User | false | null) => void,
      ) => {
        return () => {
          callback?.(null, user);
        };
      },
    );

    authController.githubCallback(req, res, next);

    expect(next).toHaveBeenCalledWith(saveError);
  });

  test("githubCallback passes session regeneration errors to next", () => {
    const regenerateError = new Error("regenerate failed");
    const user = { id: "1", email: "user@example.com" } as Express.User;
    const req = {
      session: {
        regenerate: vi.fn((callback: (err: Error | null) => void) => {
          callback(regenerateError);
        }),
        save: vi.fn(),
      },
      logIn: vi.fn(),
    } as unknown as Request;
    const { res } = createMockResponse();
    const next = vi.fn();

    authenticateMock.mockImplementation(
      (
        _strategy: string,
        callback?: (err: unknown, user: Express.User | false | null) => void,
      ) => {
        return () => {
          callback?.(null, user);
        };
      },
    );

    authController.githubCallback(req, res, next);

    expect(next).toHaveBeenCalledWith(regenerateError);
  });

  test("githubCallback redirects to the frontend after successful login and session save", () => {
    const user = { id: "1", email: "user@example.com" } as Express.User;
    const req = {
      session: {
        regenerate: vi.fn((callback: (err: Error | null) => void) => {
          callback(null);
        }),
        save: vi.fn((callback: (err: Error | null) => void) => {
          callback(null);
        }),
      },
      logIn: vi.fn(
        (_user: Express.User, callback: (err: Error | null) => void) => {
          callback(null);
        },
      ),
    } as unknown as Request;
    const { res, redirectMock } = createMockResponse();
    const next = vi.fn();

    authenticateMock.mockImplementation(
      (
        _strategy: string,
        callback?: (err: unknown, user: Express.User | false | null) => void,
      ) => {
        return () => {
          callback?.(null, user);
        };
      },
    );

    authController.githubCallback(req, res, next);

    expect(redirectMock).toHaveBeenCalledWith(env.FRONTEND_URL);
    expect(next).not.toHaveBeenCalled();
  });
});
