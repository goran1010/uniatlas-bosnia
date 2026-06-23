import { usersModel } from "../../models/usersModel.js";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { prismaUsersModelSpyOnMock } from "./utils/prismaUsersModelSpyOnMocks.js";

beforeEach(() => {
  prismaUsersModelSpyOnMock();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("usersModel", () => {
  test("findOne returns null for non-existent user", async () => {
    const user = await usersModel.findOne({ id: 999 });
    const expectedResult = null;

    expect(user).toBe(expectedResult);
  });

  test("findOne returns correct user", async () => {
    const user = await usersModel.findOne({ id: 1 });
    const expectedResult = {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
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

  test("findMany returns correct users by name", async () => {
    const users = await usersModel.findMany({ name: "Jane Smith" });
    const expectedResult = {
      isArray: true,
      length: 1,
      firstUser: {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@example.com",
      },
    };

    expect({
      isArray: Array.isArray(users),
      length: users.length,
      firstUser: users[0],
    }).toEqual(expectedResult);
  });

  test("create creates a new user", async () => {
    const newUser = await usersModel.create({
      name: "Bob Brown",
      email: "bob.brown@example.com",
    });
    const expectedResult = {
      id: 4,
      name: "Bob Brown",
      email: "bob.brown@example.com",
    };

    expect(newUser).toEqual(expectedResult);
  });

  test("update updates an existing user", async () => {
    const updatedUser = await usersModel.update(
      { id: 1 },
      { name: "Johnathan Doe", email: "johnathan.doe@example.com" },
    );
    const expectedResult = {
      id: 1,
      name: "Johnathan Doe",
      email: "johnathan.doe@example.com",
    };

    expect(updatedUser).toEqual(expectedResult);
  });

  test("deleteAll deletes all users", async () => {
    const deletedCount = await usersModel.deleteAll();
    const expectedResult = { count: 3 };

    expect(deletedCount).toEqual(expectedResult);
  });

  test("deleteUser deletes a user", async () => {
    const deletedUser = await usersModel.deleteUser({ id: 1 });
    const expectedResult = { count: 1 };

    expect(deletedUser).toEqual(expectedResult);
  });
});
