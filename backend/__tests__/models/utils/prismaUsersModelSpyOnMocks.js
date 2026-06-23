import { prisma } from "../../../db/prisma.js";
import { vi } from "vitest";

function prismaUsersModelSpyOnMock() {
  vi.spyOn(prisma.user, "findUnique").mockImplementation(async ({ where }) => {
    const users = [
      { id: 1, name: "John Doe", email: "john.doe@example.com" },
      { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
      { id: 3, name: "Alice Johnson", email: "alice.johnson@example.com" },
    ];

    return users.find((user) => user.id === where.id) || null;
  });
  vi.spyOn(prisma.user, "findMany").mockImplementation(async (where) => {
    const users = [
      { id: 1, name: "John Doe", email: "john.doe@example.com" },
      { id: 2, name: "Jane Smith", email: "jane.smith@example.com" },
      { id: 3, name: "Alice Johnson", email: "alice.johnson@example.com" },
    ];

    if (!where) {
      return users;
    }
    const data = where.where;
    return users.filter(
      (user) => user.name.toLowerCase() === data.name.toLowerCase(),
    );
  });
  vi.spyOn(prisma.user, "create").mockImplementation(async ({ data }) => {
    return {
      id: 4,
      name: data.name,
      email: data.email,
    };
  });
  vi.spyOn(prisma.user, "update").mockImplementation(
    async ({ where, data }) => {
      return {
        id: where.id,
        name: data.name,
        email: data.email,
      };
    },
  );
  vi.spyOn(prisma.user, "deleteMany").mockImplementation(async (where) => {
    if (!where) {
      return { count: 3 };
    }
    return { count: 1 };
  });
}

export { prismaUsersModelSpyOnMock };
