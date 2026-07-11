import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

const {
  matchedDataMock,
  createPendingChangeMock,
  findPendingChangesMock,
  deletePendingChangeMock,
  disconnectMock,
  loggerErrorMock,
} = vi.hoisted(() => ({
  matchedDataMock: vi.fn(),
  createPendingChangeMock: vi.fn(),
  findPendingChangesMock: vi.fn(),
  deletePendingChangeMock: vi.fn(),
  disconnectMock: vi.fn(),
  loggerErrorMock: vi.fn(),
}));

vi.mock("express-validator", () => ({
  matchedData: matchedDataMock,
}));

vi.mock("../../../src/db/prisma.js", () => ({
  prisma: {
    $disconnect: disconnectMock,
    pendingChange: {
      create: createPendingChangeMock,
      findMany: findPendingChangesMock,
      delete: deletePendingChangeMock,
    },
  },
}));

vi.mock("../../../src/utils/logger.js", () => ({
  logger: {
    error: loggerErrorMock,
  },
}));

import { contributionController } from "../../../src/controllers/contributionController.js";

import type { Request, Response } from "express";
import type {
  entityType,
  typeOfChange,
} from "../../../src/generated/prisma/client.js";
import type { JsonValue } from "@prisma/client/runtime/client";

interface MockedResult {
  id: string;
  entityType: entityType;
  typeOfChange: typeOfChange;
  targetId: number | null;
  parentId: number | null;
  userId: string;
  createdAt: Date;
  reviewedAt: Date | null;
  data: JsonValue;
}

function createMockResponse() {
  const statusMock = vi.fn().mockReturnThis();
  const jsonMock = vi.fn();

  const res = {
    status: statusMock,
    json: jsonMock,
  } as unknown as Response;

  return { res, statusMock, jsonMock };
}

describe("contributionController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    disconnectMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("createEntity responds with status 400 when contribution data is invalid", async () => {
    const req = {
      user: { id: "1" },
    } as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    matchedDataMock.mockReturnValue({
      entityType: "UNIVERSITY",
    });

    await contributionController.createEntity(req, res);

    expect(createPendingChangeMock).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message: "Invalid contribution data.",
      },
    });
  });

  test("createEntity responds with status 500 when pending change creation fails", async () => {
    const failure = new Error("create failed");
    const req = {
      user: { id: "1" },
    } as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    matchedDataMock.mockReturnValue({
      entityType: "UNIVERSITY",
      data: {
        name: "TestCity University",
        city: "TestCity",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });
    createPendingChangeMock.mockRejectedValue(failure);

    await contributionController.createEntity(req, res);

    expect(loggerErrorMock).toHaveBeenCalledWith(failure);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message: "An error occurred while submitting the suggestion.",
      },
    });
  });

  test("editEntity responds with status 401 when user is not authenticated", async () => {
    const req = {} as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    await contributionController.editEntity(req, res);

    expect(matchedDataMock).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message: "Authentication required: log in and try again.",
      },
    });
  });

  test("editEntity responds with status 400 when contribution data is invalid", async () => {
    const req = {
      user: { id: "1" },
    } as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    matchedDataMock.mockReturnValue({
      entityType: "UNIVERSITY",
      targetId: 1,
    });

    await contributionController.editEntity(req, res);

    expect(createPendingChangeMock).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message: "Invalid contribution data.",
      },
    });
  });

  test("editEntity responds with status 500 when pending change creation fails", async () => {
    const failure = new Error("update failed");
    const req = {
      user: { id: "1" },
    } as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    matchedDataMock.mockReturnValue({
      entityType: "UNIVERSITY",
      targetId: 1,
      data: { name: "Updated Name" },
    });
    createPendingChangeMock.mockRejectedValue(failure);

    await contributionController.editEntity(req, res);

    expect(loggerErrorMock).toHaveBeenCalledWith(failure);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message: "An error occurred while submitting the edit suggestion.",
      },
    });
  });

  test("deleteEntity responds with status 401 when user is not authenticated", async () => {
    const req = {} as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    await contributionController.deleteEntity(req, res);

    expect(matchedDataMock).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message: "Authentication required: log in and try again.",
      },
    });
  });

  test("deleteEntity responds with status 500 when pending change creation fails", async () => {
    const failure = new Error("delete failed");
    const req = {
      user: { id: "1" },
    } as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    matchedDataMock.mockReturnValue({
      entityType: "UNIVERSITY",
      targetId: 1,
    });
    createPendingChangeMock.mockRejectedValue(failure);

    await contributionController.deleteEntity(req, res);

    expect(loggerErrorMock).toHaveBeenCalledWith(failure);
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message: "An error occurred while submitting the deletion suggestion.",
      },
    });
  });

  test("getPendingChanges responds with status 401 when user is not authenticated", async () => {
    const req = {} as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    await contributionController.getPendingChanges(req, res);

    expect(findPendingChangesMock).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message: "Authentication required: log in and try again.",
      },
    });
  });

  test("deletePendingChange responds with status 401 when user is not authenticated", async () => {
    const req = {} as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    await contributionController.deletePendingChange(req, res);

    expect(matchedDataMock).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message: "Authentication required: log in and try again.",
      },
    });
  });

  test("deletePendingChange responds with status 404 when pending change does not exist", async () => {
    const req = {
      user: { id: "1" },
    } as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    matchedDataMock.mockReturnValue({
      id: "pending-change-1",
    });
    findPendingChangesMock.mockResolvedValue([]);

    await contributionController.deletePendingChange(req, res);

    expect(deletePendingChangeMock).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message: "Pending change not found.",
      },
    });
  });

  test("deletePendingChange responds with status 200 when pending change exists", async () => {
    const pendingChange: MockedResult = {
      id: "pending-change-2",
      entityType: "UNIVERSITY",
      typeOfChange: "CREATE",
      targetId: null,
      parentId: null,
      userId: "1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      reviewedAt: null,
      data: { name: "TestCity University" },
    };
    const req = {
      user: { id: "1" },
    } as Request;
    const { res, statusMock, jsonMock } = createMockResponse();

    matchedDataMock.mockReturnValue({
      id: pendingChange.id,
    });
    findPendingChangesMock.mockResolvedValue([pendingChange]);
    deletePendingChangeMock.mockResolvedValue(pendingChange);

    await contributionController.deletePendingChange(req, res);

    expect(deletePendingChangeMock).toHaveBeenCalledWith({
      where: { id: pendingChange.id },
    });
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      data: null,
      message: "Pending change deleted successfully.",
    });
  });
});
