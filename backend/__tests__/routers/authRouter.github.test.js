import request from "supertest";
import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/config/passport.js", async (importOriginal) => {
  const actual = await importOriginal();

  actual.passport.authenticate = vi.fn(() => (req, res, next) => next());

  return actual;
});

const { app } = await import("../../src/app.js");
const { passport } = await import("../../src/config/passport.js");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Auth Router - GET /auth/github", () => {
  test("responds with status 302 and redirects to GitHub for authentication", async () => {
    passport.authenticate.mockImplementation(() => {
      return (req, res) => {
        res.redirect("https://github.com/login/oauth/authorize");
      };
    });

    const response = await request(app).get("/auth/github");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(
      "https://github.com/login/oauth/authorize",
    );

    expect(passport.authenticate).toHaveBeenCalledWith("github", {
      scope: ["user:email"],
    });
  });
});

describe("Auth Router - GET /auth/github/callback", () => {
  test("responds with status 302 and redirects to frontend if GitHub authentication fails", async () => {
    passport.authenticate.mockImplementation(() => {
      return (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL}/login?error=github`);
      };
    });

    const response = await request(app).get("/auth/github/callback");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(
      `${process.env.FRONTEND_URL}/login?error=github`,
    );

    expect(passport.authenticate).toHaveBeenCalledWith(
      "github",
      expect.any(Function),
    );
  });

  test("responds with status 302 and redirects to frontend if GitHub authentication is successful when session exists", async () => {
    const fakeGithubUser = {
      id: "user-1",
      email: "github-user@example.com",
    };

    passport.authenticate.mockImplementation((strategy, callback) => {
      return (req) => {
        req.logIn = (user, done) => done(null);
        req.session.regenerate = (done) => done(null);
        req.session.save = (done) => done(null);
        callback(null, fakeGithubUser);
      };
    });

    const response = await request(app).get("/auth/github/callback");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(process.env.FRONTEND_URL);

    expect(passport.authenticate).toHaveBeenCalledWith(
      "github",
      expect.any(Function),
    );
  });
});
