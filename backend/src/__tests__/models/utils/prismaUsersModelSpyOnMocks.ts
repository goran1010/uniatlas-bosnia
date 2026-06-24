import { vi } from "vitest";

const users = [
  {
    id: "1",
    email: "john.doe@example.com",
    githubId: "123",
    password: null,
    role: "USER",
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    githubId: "456",
    password: null,
    role: "USER",
  },
  {
    id: "3",
    email: "alice.johnson@example.com",
    githubId: "789",
    password: null,
    role: "USER",
  },
];

const disconnectMock = vi.fn().mockResolvedValue(undefined);

const findUniqueMock = vi.fn().mockImplementation(async ({ where }) => {
  return users.find((user) => user.id === where.id) || null;
});

const findManyMock = vi.fn().mockImplementation(async (args) => {
  if (!args?.where) {
    return users;
  }

  if (args.where.id) {
    return users.filter((user) => user.id === args.where.id);
  }

  return users;
});

const createMock = vi.fn().mockImplementation(async ({ data }) => {
  return {
    id: "4",
    email: data.email,
    githubId: data.githubId || null,
    password: null,
    role: "USER",
  };
});

const updateMock = vi.fn().mockImplementation(async ({ where, data }) => {
  return {
    id: where.id,
    email: data.email || "updated.email@example.com",
    githubId: data.githubId || "updatedGithubId",
    password: null,
    role: "USER",
  };
});

const deleteManyMock = vi.fn().mockImplementation(async (args) => {
  if (!args?.where) {
    return { count: 3 };
  }

  return { count: 1 };
});

vi.mock("../../../db/prisma.js", () => {
  return {
    prisma: {
      $disconnect: disconnectMock,
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

function prismaUsersModelSpyOnMock() {
  findUniqueMock.mockClear();
  findManyMock.mockClear();
  createMock.mockClear();
  updateMock.mockClear();
  deleteManyMock.mockClear();
  disconnectMock.mockClear();

  findUniqueMock.mockImplementation(async ({ where }) => {
    return users.find((user) => user.id === where.id) || null;
  });

  findManyMock.mockImplementation(async (args) => {
    if (!args?.where) {
      return users;
    }

    if (args.where.id) {
      return users.filter((user) => user.id === args.where.id);
    }

    return users;
  });

  createMock.mockImplementation(async ({ data }) => {
    return {
      id: "4",
      email: data.email,
      githubId: data.githubId || null,
      password: null,
      role: "USER",
    };
  });

  updateMock.mockImplementation(async ({ where, data }) => {
    return {
      id: where.id,
      email: data.email || "updated.email@example.com",
      githubId: data.githubId || "updatedGithubId",
      password: null,
      role: "USER",
    };
  });

  deleteManyMock.mockImplementation(async (args) => {
    if (!args?.where) {
      return { count: 3 };
    }

    return { count: 1 };
  });

  disconnectMock.mockResolvedValue(undefined);
}

export {
  prismaUsersModelSpyOnMock,
  findUniqueMock,
  findManyMock,
  createMock,
  updateMock,
  deleteManyMock,
  disconnectMock,
};
