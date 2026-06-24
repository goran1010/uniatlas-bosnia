import request from "supertest";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { pendingChangesModel } from "../../src/models/pendingChangesModel.js";
import { app } from "../../src/app.js";

let mockedUser = null;

vi.mock("../../src/auth/isAuthenticated.js", () => {
  return {
    isAuthenticated: (req, res, next) => {
      req.user = mockedUser;
      if (req.user) return next();

      res.status(401).json({
        error: "You are not logged in.",
        details: [{ msg: null }],
      });
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  mockedUser = null;
});

describe("POST /users/contribution/universities", () => {
  test("responds with status 401 and You need to be logged in to access this route if not logged in", async () => {
    const notLoggedInResponse = {
      error: "You are not logged in.",
      details: [{ msg: null }],
    };

    const response = await request(app).post(
      "/users/contribution/universities",
    );
    const expectedResponse = {
      status: 401,
      body: notLoggedInResponse,
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("No entityType sent responds with status 400 and Entity type is required", async () => {
    mockedUser = {
      id: 1,
      username: "user1",
      email: "user1@example.com",
    };
    const agent = request.agent(app);

    const expectedResponse = "Entity type is required";
    const response = await agent.post("/users/contribution/universities");
    const expectedResponseData = {
      status: 400,
      body: expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining(expectedResponse),
        }),
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponseData));
  });

  test("Valid request responds with status 201 and Suggestion submitted", async () => {
    const mockResult = {
      id: "uuid-1",
      entityType: "UNIVERSITY",
      typeOfChange: "CREATE",
      data: {
        name: "TestCity University",
        city: "TestCity",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    };
    vi.spyOn(pendingChangesModel, "create").mockResolvedValue(mockResult);

    mockedUser = {
      id: 1,
      username: "user1",
      email: "user1@example.com",
    };
    const agent = request.agent(app);

    const response = await agent.post("/users/contribution/universities").send({
      entityType: "UNIVERSITY",
      data: {
        name: "TestCity University",
        city: "TestCity",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });
    const expectedResponseData = {
      status: 201,
      body: {
        message: "Suggestion submitted. An admin will review it.",
        data: mockResult,
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponseData));
  });
});

describe("PUT /users/contribution/universities", () => {
  test("responds with status 401 and You need to be logged in to access this route if not logged in", async () => {
    const notLoggedInResponse = {
      error: "You are not logged in.",
      details: [{ msg: null }],
    };

    const response = await request(app).put("/users/contribution/universities");
    const expectedResponse = {
      status: 401,
      body: notLoggedInResponse,
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("No entityType sent responds with status 400 and Entity type is required", async () => {
    mockedUser = {
      id: 1,
      username: "user1",
      email: "user1@example.com",
    };
    const agent = request.agent(app);

    const expectedResponse = "Entity type is required";
    const responseCode = await agent.put("/users/contribution/universities");
    const expectedResponseData = {
      status: 400,
      body: expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining(expectedResponse),
        }),
      }),
    };

    expect(responseCode).toEqual(expect.objectContaining(expectedResponseData));
  });

  test("Valid request responds with status 201 and Edit suggestion submitted", async () => {
    const mockResult = {
      id: "uuid-2",
      entityType: "UNIVERSITY",
      typeOfChange: "UPDATE",
      targetId: 1,
      data: { name: "Updated Name" },
    };
    vi.spyOn(pendingChangesModel, "create").mockResolvedValue(mockResult);

    mockedUser = {
      id: 1,
      username: "user1",
      email: "user1@example.com",
    };
    const agent = request.agent(app);

    const response = await agent.put("/users/contribution/universities").send({
      entityType: "UNIVERSITY",
      targetId: 1,
      data: { name: "Updated Name" },
    });
    const expectedResponseData = {
      status: 201,
      body: {
        message: "Edit suggestion submitted. An admin will review it.",
        data: mockResult,
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponseData));
  });
});

describe("DELETE /users/contribution/universities", () => {
  test("responds with status 401 and You need to be logged in to access this route if not logged in", async () => {
    const notLoggedInResponse = {
      error: "You are not logged in.",
      details: [{ msg: null }],
    };

    const response = await request(app).delete(
      "/users/contribution/universities",
    );
    const expectedResponse = {
      status: 401,
      body: notLoggedInResponse,
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("No entityType sent responds with status 400 and Entity type is required", async () => {
    mockedUser = {
      id: 1,
      username: "user1",
      email: "user1@example.com",
    };
    const agent = request.agent(app);

    const expectedResponse = "Entity type is required";
    const responseCode = await agent.delete("/users/contribution/universities");
    const expectedResponseData = {
      status: 400,
      body: expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining(expectedResponse),
        }),
      }),
    };

    expect(responseCode).toEqual(expect.objectContaining(expectedResponseData));
  });

  test("Valid request responds with status 201 and Deletion suggestion submitted", async () => {
    const mockResult = {
      id: "uuid-3",
      entityType: "UNIVERSITY",
      typeOfChange: "DELETE",
      targetId: 1,
      data: {},
    };
    vi.spyOn(pendingChangesModel, "create").mockResolvedValue(mockResult);

    const agent = request.agent(app);
    mockedUser = {
      id: 1,
      username: "user1",
      email: "user1@example.com",
    };

    const response = await agent
      .delete("/users/contribution/universities")
      .send({ entityType: "UNIVERSITY", targetId: 1 });
    const expectedResponseData = {
      status: 201,
      body: {
        message: "Deletion suggestion submitted. An admin will review it.",
        data: mockResult,
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponseData));
  });
});

describe("GET /users/contribution/pending-changes/universities", () => {
  test("responds with status 401 and You need to be logged in to access this route if not logged in", async () => {
    const notLoggedInResponse = {
      error: "You are not logged in.",
      details: [{ msg: null }],
    };

    const response = await request(app).get(
      "/users/contribution/pending-changes/universities",
    );
    const expectedResponse = {
      status: 401,
      body: notLoggedInResponse,
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("Valid request responds with status 200 and Pending changes retrieved successfully", async () => {
    const pendingChanges = [
      {
        id: "uuid-1",
        userId: "1",
        entityType: "UNIVERSITY",
        typeOfChange: "CREATE",
        data: { name: "TestCity University" },
      },
    ];

    vi.spyOn(pendingChangesModel, "findMany").mockResolvedValue(pendingChanges);

    mockedUser = {
      id: 1,
      username: "user1",
      email: "user1@example.com",
    };
    const agent = request.agent(app);

    const expectedResponse = {
      message: "Pending changes retrieved successfully.",
      data: pendingChanges,
    };

    const response = await agent.get(
      "/users/contribution/pending-changes/universities",
    );
    const expectedResponseData = {
      status: 200,
      body: expectedResponse,
    };

    expect(response).toEqual(expect.objectContaining(expectedResponseData));
  });
});

describe("DELETE /users/contribution/pending-changes/universities", () => {
  test("responds with status 401 and You need to be logged in to access this route if not logged in", async () => {
    const notLoggedInResponse = {
      error: "You are not logged in.",
      details: [{ msg: null }],
    };

    const response = await request(app).delete(
      "/users/contribution/pending-changes/universities",
    );
    const expectedResponse = {
      status: 401,
      body: notLoggedInResponse,
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("Valid request responds with status 200 and Pending change deleted successfully", async () => {
    const pendingChange = {
      id: "36d5cc88-1f4d-4d8a-9e4f-8dc06f1cb001",
      userId: "1",
      entityType: "UNIVERSITY",
      typeOfChange: "CREATE",
      data: { name: "TestCity University" },
    };

    vi.spyOn(pendingChangesModel, "findMany").mockResolvedValue([
      pendingChange,
    ]);
    vi.spyOn(pendingChangesModel, "delete").mockResolvedValue(pendingChange);

    mockedUser = {
      id: "1",
      username: "user1",
      email: "user1@example.com",
    };
    const agent = request.agent(app);

    const response = await agent
      .delete("/users/contribution/pending-changes/universities")
      .send({ id: pendingChange.id });

    const expectedResponse = {
      status: 200,
      body: {
        message: "Pending change deleted successfully.",
        data: null,
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});
