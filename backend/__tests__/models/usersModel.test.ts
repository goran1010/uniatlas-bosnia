import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { prismaUsersModelSpyOnMock } from "./utils/prismaUsersModelSpyOnMocks.js";

const { usersModel } = await import("../../src/models/usersModel.js");

beforeEach(() => {
  prismaUsersModelSpyOnMock();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("usersModel", () => {
  test("findOne returns null for non-existent user", async () => {
    const user = await usersModel.findOne({ id: "999" });
    const expectedResult = null;

    expect(user).toBe(expectedResult);
  });

  test("findOne returns correct user", async () => {
    const user = await usersModel.findOne({ id: "1" });
    const expectedResult = {
      id: "1",
      email: "john.doe@example.com",
      githubId: "123",
      password: null,
      role: "USER",
    };

    expect(user).toEqual(expectedResult);
  });

  test("findMany returns all users", async () => {
    const users = await usersModel.findMany();
    const expectedResult = {
      isArray: true,
      length: 3,
    };

    expect({
      isArray: Array.isArray(users),
      length: users.length,
    }).toEqual(expectedResult);
  });

  test("create creates a new user", async () => {
    const newUser = await usersModel.create({
      email: "bob.brown@example.com",
    });
    const expectedResult = {
      id: "4",
      email: "bob.brown@example.com",
      githubId: null,
      password: null,
      role: "USER",
    };

    expect(newUser).toEqual(expectedResult);
  });

  test("update updates an existing user", async () => {
    const updatedUser = await usersModel.update(
      { id: "1" },
      { email: "johnathan.doe@example.com" },
    );
    const expectedResult = {
      id: "1",
      email: "johnathan.doe@example.com",
      githubId: "updatedGithubId",
      password: null,
      role: "USER",
    };

    expect(updatedUser).toEqual(expectedResult);
  });

  test("deleteAll deletes all users", async () => {
    const deletedCount = await usersModel.deleteAll();
    const expectedResult = { count: 3 };

    expect(deletedCount).toEqual(expectedResult);
  });

  test("deleteUser deletes a user", async () => {
    const deletedUser = await usersModel.deleteUser({ id: "1" });
    const expectedResult = { count: 1 };

    expect(deletedUser).toEqual(expectedResult);
  });
});
