import { sanitizeUser, sanitizeUsers } from "../src/utils/sanitizeUser";
import { describe, test, expect } from "vitest";

describe("sanitizeUser", () => {
  test("should return null if user is null", () => {
    expect(sanitizeUser(null)).toBeNull();
  });

  test("should return undefined if user is undefined", () => {
    expect(sanitizeUser(undefined)).toBeUndefined();
  });

  test("should remove password from user object", () => {
    const user = {
      id: 1,
      username: "testuser",
      password: "secret",
      email: "testuser@example.com",
    };
    const sanitizedUser = sanitizeUser(user);

    expect(sanitizedUser).not.toHaveProperty("password");
    expect(sanitizedUser).toHaveProperty("email", "testuser@example.com");
  });
});

describe("sanitizeUsers", () => {
  test("should return an empty array if users is empty", () => {
    expect(sanitizeUsers([])).toEqual([]);
  });

  test("should sanitize an array of user objects", () => {
    const users = [
      {
        id: 1,
        username: "user1",
        password: "secret1",
        email: "user1@example.com",
      },
      {
        id: 2,
        username: "user2",
        password: "secret2",
        email: "user2@example.com",
      },
    ];
    const sanitizedUsers = sanitizeUsers(users);
    sanitizedUsers.forEach((user) => {
      expect(user).not.toHaveProperty("password");
      expect(user).toHaveProperty("email");
    });
  });
});
