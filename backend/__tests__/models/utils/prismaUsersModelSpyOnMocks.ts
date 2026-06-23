import { vi } from "vitest";

const findUniqueMock = vi.fn().mockImplementation(async ({ where }) => {
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      githubId: "123",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      githubId: "456",
    },
    {
      id: 3,
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      githubId: "789",
    },
  ];

  return users.find((user) => user.id === Number(where.id)) || null;
});

const findManyMock = vi.fn().mockImplementation(async (where) => {
  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      githubId: "123",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      githubId: "456",
    },
    {
      id: 3,
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      githubId: "789",
    },
  ];

  if (!where) {
    return users;
  }
  const data = where.where;
  return users.filter(
    (user) => user.name.toLowerCase() === data.name.toLowerCase(),
  );
});

const createMock = vi.fn().mockImplementation(async ({ data }) => {
  return {
    id: Math.floor(Math.random() * 1000),
    name: data.name,
    email: data.email,
    githubId: data.githubId || null,
  };
});

const updateMock = vi.fn().mockImplementation(async ({ where, data }) => {
  return {
    id: where.id,
    name: data.name || "Updated Name",
    email: data.email || "updated.email@example.com",
    githubId: data.githubId || "updatedGithubId",
  };
});

const deleteManyMock = vi.fn().mockImplementation(async (where) => {
  if (!where) {
    return { count: 3 };
  }
  return { count: 1 };
});

function prismaUsersModelSpyOnMock() {
  vi.mock("../../../src/db/prisma.js", () => {
    const originalModule = vi.importActual("../../../src/db/prisma.js");
    return {
      ...originalModule,
      prisma: {
        user: {
          findUnique: findUniqueMock,
          findMany: findManyMock,
          create: createMock,
          update: updateMock,
          deleteMany: deleteManyMock,
        },
      },
    };
  });
}

export { prismaUsersModelSpyOnMock };
