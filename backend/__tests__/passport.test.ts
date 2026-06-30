import { beforeEach, describe, expect, test, vi } from "vitest";
import type { VerifyFunction, IStrategyOptions } from "passport-local";
import type { StrategyOptions } from "passport-github2";
import type { DoneCallback } from "passport";

interface MockGitHubProfile {
  id: string | number;
  emails?: { value: string }[];
}

type GitHubVerifyFunction = (
  accessToken: string,
  refreshToken: string,
  profile: MockGitHubProfile,
  done: DoneCallback,
) => void | Promise<void>;

class MockLocalStrategy {
  name = "local";
  options: IStrategyOptions;
  _verify: VerifyFunction;

  constructor(options: IStrategyOptions, verify: VerifyFunction) {
    this.options = options;
    this._verify = verify;
  }
}

class MockGitHubStrategy {
  name = "github";
  options: StrategyOptions;
  _verify: GitHubVerifyFunction;

  constructor(options: StrategyOptions, verify: GitHubVerifyFunction) {
    this.options = options;
    this._verify = verify;
  }
}

const passportMock = {
  use: vi.fn(),
  serializeUser: vi.fn(),
  deserializeUser: vi.fn(),
};

const usersModelMock = {
  findOne: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
};

const bcryptMock = {
  compare: vi.fn(),
};

vi.mock("passport", () => ({
  default: passportMock,
}));

vi.mock("passport-local", () => ({
  Strategy: MockLocalStrategy,
}));

vi.mock("passport-github2", () => ({
  Strategy: MockGitHubStrategy,
}));

vi.mock("bcryptjs", () => ({
  default: bcryptMock,
}));

vi.mock("../src/models/usersModel.js", () => ({
  usersModel: usersModelMock,
}));

async function loadStrategies() {
  await import("../src/config/passport.js");

  const localStrategy = passportMock.use.mock.calls[0]?.[0] as
    | MockLocalStrategy
    | undefined;
  const githubStrategy = passportMock.use.mock.calls[1]?.[0] as
    | MockGitHubStrategy
    | undefined;

  if (!localStrategy || !githubStrategy) {
    throw new Error(
      "Passport strategies were not registered during test setup.",
    );
  }

  const serializeUser = passportMock.serializeUser.mock.calls[0]?.[0];
  const deserializeUser = passportMock.deserializeUser.mock.calls[0]?.[0];

  if (!serializeUser || !deserializeUser) {
    throw new Error(
      "Passport serializers were not registered during test setup.",
    );
  }

  return {
    localVerify: localStrategy._verify,
    githubVerify: githubStrategy._verify,
    serializeUser,
    deserializeUser,
  };
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();

  usersModelMock.findOne.mockReset();
  usersModelMock.update.mockReset();
  usersModelMock.create.mockReset();
  bcryptMock.compare.mockReset();
});

describe("passport config", () => {
  test("LocalStrategy returns auth error when password does not match", async () => {
    const { localVerify } = await loadStrategies();
    const done = vi.fn();

    usersModelMock.findOne.mockResolvedValue({ id: 1, password: "hashed" });
    bcryptMock.compare.mockResolvedValue(false);

    await localVerify("john@example.com", "wrong-password", done);

    expect(usersModelMock.findOne).toHaveBeenCalledWith({
      email: "john@example.com",
    });
    expect(bcryptMock.compare).toHaveBeenCalledWith("wrong-password", "hashed");
    expect(done).toHaveBeenCalledWith(null, false, {
      message: "Incorrect email or password",
    });
  });

  test("LocalStrategy passes thrown model error to done", async () => {
    const { localVerify } = await loadStrategies();
    const done = vi.fn();
    const dbError = new Error("db down");

    usersModelMock.findOne.mockRejectedValue(dbError);

    await localVerify("john@example.com", "any", done);

    expect(done).toHaveBeenCalledWith(dbError);
  });

  test("GitHubStrategy returns existing user by githubId", async () => {
    const { githubVerify } = await loadStrategies();
    const done = vi.fn();
    const existingUser = { id: 10, githubId: "123" };

    usersModelMock.findOne.mockResolvedValueOnce(existingUser);

    await githubVerify("token", "refresh", { id: 123 }, done);

    expect(usersModelMock.findOne).toHaveBeenCalledWith({ githubId: "123" });
    expect(done).toHaveBeenCalledWith(null, existingUser);
    expect(usersModelMock.update).not.toHaveBeenCalled();
    expect(usersModelMock.create).not.toHaveBeenCalled();
  });

  test("GitHubStrategy returns auth error when profile has no public email", async () => {
    const { githubVerify } = await loadStrategies();
    const done = vi.fn();

    usersModelMock.findOne.mockResolvedValueOnce(null);

    await githubVerify("token", "refresh", { id: 123, emails: [] }, done);

    expect(done).toHaveBeenCalledWith(null, false);
    expect(usersModelMock.update).not.toHaveBeenCalled();
    expect(usersModelMock.create).not.toHaveBeenCalled();
  });

  test("GitHubStrategy links githubId to existing email user", async () => {
    const { githubVerify } = await loadStrategies();
    const done = vi.fn();
    const userByEmail = { id: 7, email: "github-user@example.com" };
    const linkedUser = {
      id: 7,
      email: "github-user@example.com",
      githubId: "123",
    };

    usersModelMock.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(userByEmail);
    usersModelMock.update.mockResolvedValue(linkedUser);

    await githubVerify(
      "token",
      "refresh",
      { id: 123, emails: [{ value: "github-user@example.com" }] },
      done,
    );

    expect(usersModelMock.findOne).toHaveBeenNthCalledWith(1, {
      githubId: "123",
    });
    expect(usersModelMock.findOne).toHaveBeenNthCalledWith(2, {
      email: "github-user@example.com",
    });
    expect(usersModelMock.update).toHaveBeenCalledWith(
      { id: 7 },
      { githubId: "123" },
    );
    expect(done).toHaveBeenCalledWith(null, linkedUser);
  });

  test("GitHubStrategy creates user when githubId and email user do not exist", async () => {
    const { githubVerify } = await loadStrategies();
    const done = vi.fn();
    const createdUser = {
      id: 9,
      email: "new-github@example.com",
      githubId: "555",
    };

    usersModelMock.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    usersModelMock.create.mockResolvedValue(createdUser);

    await githubVerify(
      "token",
      "refresh",
      { id: 555, emails: [{ value: "new-github@example.com" }] },
      done,
    );

    expect(usersModelMock.create).toHaveBeenCalledWith({
      email: "new-github@example.com",
      githubId: "555",
    });
    expect(done).toHaveBeenCalledWith(null, createdUser);
  });

  test("GitHubStrategy passes thrown error to done", async () => {
    const { githubVerify } = await loadStrategies();
    const done = vi.fn();
    const githubError = new Error("github failure");

    usersModelMock.findOne.mockRejectedValue(githubError);

    await githubVerify("token", "refresh", { id: 1000 }, done);

    expect(done).toHaveBeenCalledWith(githubError);
  });

  test("serializeUser calls done with user id", async () => {
    const { serializeUser } = await loadStrategies();
    const done = vi.fn();

    serializeUser({ id: 42 }, done);

    expect(done).toHaveBeenCalledWith(null, 42);
  });

  test("serializeUser catches thrown error from done callback", async () => {
    const { serializeUser } = await loadStrategies();
    const done = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new Error("done explode");
      })
      .mockImplementation(() => vi.fn());

    serializeUser({ id: 42 }, done);

    expect(done).toHaveBeenCalledTimes(2);
    const secondCallError = done.mock.calls[1]?.[0];

    expect(secondCallError).toBeInstanceOf(Error);
    expect((secondCallError as Error).message).toBe("done explode");
  });

  test("deserializeUser returns fetched user", async () => {
    const { deserializeUser } = await loadStrategies();
    const done = vi.fn();
    const user = { id: 2, email: "u@example.com" };

    usersModelMock.findOne.mockResolvedValue(user);

    await deserializeUser(2, done);

    expect(usersModelMock.findOne).toHaveBeenCalledWith({ id: 2 });
    expect(done).toHaveBeenCalledWith(null, user);
  });

  test("deserializeUser passes thrown model error to done", async () => {
    const { deserializeUser } = await loadStrategies();
    const done = vi.fn();
    const dbError = new Error("db read failed");

    usersModelMock.findOne.mockRejectedValue(dbError);

    await deserializeUser(2, done);

    expect(done).toHaveBeenCalledWith(dbError);
  });
});
