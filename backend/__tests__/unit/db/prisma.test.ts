import { beforeEach, vi, describe, test, expect } from "vitest";

vi.mock("dotenv/config.js", () => ({}));

interface MockAdapter {
  connectionString: string;
}

interface MockPrismaClientOptions {
  adapter: MockAdapter;
}

const prismaPgMock = vi
  .fn<(options: MockAdapter) => void>()
  .mockImplementation(function (
    this: { connectionString: string },
    options: MockAdapter,
  ) {
    this.connectionString = options.connectionString;
  });

const prismaClientMock = vi
  .fn<(options: MockPrismaClientOptions) => void>()
  .mockImplementation(function (
    this: { adapter: MockAdapter; $disconnect: ReturnType<typeof vi.fn> },
    options: MockPrismaClientOptions,
  ) {
    this.adapter = options.adapter;
    this.$disconnect = vi.fn().mockResolvedValue(undefined);
  });

vi.mock("@prisma/adapter-pg", () => {
  return {
    PrismaPg: prismaPgMock,
  };
});

vi.mock("../../../src/generated/prisma/client.js", () => {
  return {
    PrismaClient: prismaClientMock,
  };
});

vi.mock("../../../src/config/env.js", () => {
  return {
    env: {
      TEST_DATABASE_URL: "test_database_url",
      DATABASE_URL: "database_url",
    },
  };
});

describe("Prisma Client", () => {
  const expectPrismaClientAdapter = (connectionString: string) => {
    expect(prismaClientMock).toHaveBeenCalledTimes(1);

    const [firstCall] = prismaClientMock.mock.calls;

    expect(firstCall).toBeDefined();
    if (!firstCall) {
      return;
    }

    expect(firstCall[0].adapter.connectionString).toBe(connectionString);
  };

  beforeEach(() => {
    vi.resetModules();
    prismaPgMock.mockClear();
    prismaClientMock.mockClear();
  });

  test("should create a PrismaClient instance with the correct connection string for test environment", async () => {
    process.env["NODE_ENV"] = "test";
    const { prisma } = await import("../../../src/db/prisma.js");

    expect(prisma).toBeDefined();
    expect(prismaPgMock).toHaveBeenCalledWith({
      connectionString: "test_database_url",
    });
    expectPrismaClientAdapter("test_database_url");
  });

  test("should create a PrismaClient instance with the correct connection string for non-test environment", async () => {
    process.env["NODE_ENV"] = "production";
    const { prisma } = await import("../../../src/db/prisma.js");

    expect(prisma).toBeDefined();
    expect(prismaPgMock).toHaveBeenCalledWith({
      connectionString: "database_url",
    });
    expectPrismaClientAdapter("database_url");
  });
});
