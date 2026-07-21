import request from "supertest";
import { describe, test, expect } from "vitest";

import { app } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
import { createAndLoginUser } from "../utils/createUserAndLogin.js";

function getResponseObject(body: unknown): Record<string, unknown> {
  expect(body).toBeTypeOf("object");
  expect(body).not.toBeNull();

  return body as Record<string, unknown>;
}

function expectValidationIssue(
  error: Record<string, unknown>,
  message: string,
) {
  expect(error["code"]).toBe("VALIDATION_ERROR");
  expect(error["message"]).toBe("Request validation failed.");
  expect(error["issues"]).toEqual(
    expect.arrayContaining([expect.objectContaining({ message })]),
  );
}

async function createLoggedInAgent() {
  const agent = request.agent(app);
  const loginResponse = await createAndLoginUser(agent, {});

  expect(loginResponse.status).toBe(200);
  expect(loginResponse.body).toEqual(
    expect.objectContaining({
      message: "Logged in successfully",
    }),
  );

  const loginResponseBody = getResponseObject(loginResponse.body as unknown);
  const user = getResponseObject(loginResponseBody["data"]) as {
    id: string;
    email: string;
  };
  return { agent, user };
}

describe("Contribution Router - POST /users/contribution/universities", () => {
  test("responds with status 401 when not logged in", async () => {
    const response = await request(app).post(
      "/users/contribution/universities",
    );

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        message: "Authentication required: log in and try again.",
      },
    });
  });

  test("responds with status 400 when entityType is missing", async () => {
    const { agent } = await createLoggedInAgent();

    const response = await agent.post("/users/contribution/universities");
    const responseBody = getResponseObject(response.body);
    const error = getResponseObject(responseBody["error"]);

    expect(response.status).toBe(400);
    expectValidationIssue(error, "Entity type is required");
  });

  test("responds with status 400 for unsupported data fields", async () => {
    const { agent } = await createLoggedInAgent();

    const response = await agent.post("/users/contribution/universities").send({
      entityType: "UNIVERSITY",
      data: {
        name: "TestCity University",
        city: "TestCity",
        entity: "FBIH",
        ownership: "JAVNA",
        ects: 240,
      },
    });
    const responseBody = getResponseObject(response.body);
    const error = getResponseObject(responseBody["error"]);

    expect(response.status).toBe(400);
    expectValidationIssue(
      error,
      "Data contains unsupported fields for this entity type",
    );
  });

  test("responds with status 201 and stores a create suggestion", async () => {
    const { agent, user } = await createLoggedInAgent();

    const response = await agent.post("/users/contribution/universities").send({
      entityType: "UNIVERSITY",
      data: {
        name: "TestCity University",
        city: "TestCity",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Suggestion submitted. An admin will review it.",
      }),
    );

    const responseBody = getResponseObject(response.body);
    const data = getResponseObject(responseBody["data"]);
    const pendingChangeId = data["id"] as string;
    const pendingChange = await prisma.pendingChange.findUnique({
      where: { id: pendingChangeId },
    });

    expect(pendingChange).toEqual(
      expect.objectContaining({
        userId: user.id,
        entityType: "UNIVERSITY",
        typeOfChange: "CREATE",
        parentId: null,
        targetId: null,
        data: {
          name: "TestCity University",
          city: "TestCity",
          entity: "FBIH",
          ownership: "JAVNA",
        },
      }),
    );
  });
});

describe("Contribution Router - PUT /users/contribution/universities", () => {
  test("responds with status 401 when not logged in", async () => {
    const response = await request(app).put("/users/contribution/universities");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        message: "Authentication required: log in and try again.",
      },
    });
  });

  test("responds with status 400 when entityType is missing", async () => {
    const { agent } = await createLoggedInAgent();

    const response = await agent.put("/users/contribution/universities");
    const responseBody = getResponseObject(response.body);
    const error = getResponseObject(responseBody["error"]);

    expect(response.status).toBe(400);
    expectValidationIssue(error, "Entity type is required");
  });

  test("responds with status 201 and stores an edit suggestion", async () => {
    const { agent, user } = await createLoggedInAgent();

    const response = await agent.put("/users/contribution/universities").send({
      entityType: "UNIVERSITY",
      targetId: 1,
      data: { name: "Updated Name" },
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Edit suggestion submitted. An admin will review it.",
      }),
    );

    const responseBody = getResponseObject(response.body);
    const data = getResponseObject(responseBody["data"]);
    const pendingChangeId = data["id"] as string;
    const pendingChange = await prisma.pendingChange.findUnique({
      where: { id: pendingChangeId },
    });

    expect(pendingChange).toEqual(
      expect.objectContaining({
        userId: user.id,
        entityType: "UNIVERSITY",
        typeOfChange: "UPDATE",
        targetId: 1,
        data: { name: "Updated Name" },
      }),
    );
  });
});

describe("Contribution Router - DELETE /users/contribution/universities", () => {
  test("responds with status 401 when not logged in", async () => {
    const response = await request(app).delete(
      "/users/contribution/universities",
    );

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        message: "Authentication required: log in and try again.",
      },
    });
  });

  test("responds with status 400 when entityType is missing", async () => {
    const { agent } = await createLoggedInAgent();

    const response = await agent.delete("/users/contribution/universities");
    const responseBody = getResponseObject(response.body);
    const error = getResponseObject(responseBody["error"]);

    expect(response.status).toBe(400);
    expectValidationIssue(error, "Entity type is required");
  });

  test("responds with status 201 and stores a deletion suggestion", async () => {
    const { agent, user } = await createLoggedInAgent();

    const response = await agent
      .delete("/users/contribution/universities")
      .send({ entityType: "UNIVERSITY", targetId: 1 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Deletion suggestion submitted. An admin will review it.",
      }),
    );

    const responseBody = getResponseObject(response.body);
    const data = getResponseObject(responseBody["data"]);
    const pendingChangeId = data["id"] as string;
    const pendingChange = await prisma.pendingChange.findUnique({
      where: { id: pendingChangeId },
    });

    expect(pendingChange).toEqual(
      expect.objectContaining({
        userId: user.id,
        entityType: "UNIVERSITY",
        typeOfChange: "DELETE",
        targetId: 1,
        data: {},
      }),
    );
  });
});

describe("Contribution Router - GET /users/contribution/pending-changes/universities", () => {
  test("responds with status 401 when not logged in", async () => {
    const response = await request(app).get(
      "/users/contribution/pending-changes/universities",
    );

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        message: "Authentication required: log in and try again.",
      },
    });
  });

  test("responds with status 200 and only returns pending changes for the logged-in user", async () => {
    const { agent, user } = await createLoggedInAgent();
    const otherUser = await prisma.user.create({
      data: {
        email: `other_${Date.now().toString()}@example.com`,
      },
    });

    const ownPendingChange = await prisma.pendingChange.create({
      data: {
        entityType: "UNIVERSITY",
        typeOfChange: "CREATE",
        data: {
          name: "Own University",
          city: "City",
          entity: "FBIH",
          ownership: "JAVNA",
        },
        user: { connect: { id: user.id } },
      },
    });
    await prisma.pendingChange.create({
      data: {
        entityType: "UNIVERSITY",
        typeOfChange: "CREATE",
        data: {
          name: "Other University",
          city: "City",
          entity: "FBIH",
          ownership: "JAVNA",
        },
        user: { connect: { id: otherUser.id } },
      },
    });

    const response = await agent.get(
      "/users/contribution/pending-changes/universities",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Pending changes retrieved successfully.",
      }),
    );
    const responseBody = getResponseObject(response.body);
    expect(Array.isArray(responseBody["data"])).toBe(true);
    const data = responseBody["data"] as Record<string, unknown>[];
    expect(data).toHaveLength(1);
    expect(data[0]).toEqual(
      expect.objectContaining({
        id: ownPendingChange.id,
        userId: user.id,
      }),
    );
  });
});

describe("Contribution Router - DELETE /users/contribution/pending-changes/universities", () => {
  test("responds with status 401 when not logged in", async () => {
    const response = await request(app).delete(
      "/users/contribution/pending-changes/universities",
    );

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: {
        message: "Authentication required: log in and try again.",
      },
    });
  });

  test("responds with status 404 when the pending change does not exist for the logged-in user", async () => {
    const { agent } = await createLoggedInAgent();

    const response = await agent
      .delete("/users/contribution/pending-changes/universities")
      .send({ id: "4e7d6077-6b57-48d1-a113-686731b5137e" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        message: "Pending change not found.",
      },
    });
  });

  test("responds with status 200 and deletes an existing pending change", async () => {
    const { agent, user } = await createLoggedInAgent();
    const pendingChange = await prisma.pendingChange.create({
      data: {
        entityType: "UNIVERSITY",
        typeOfChange: "CREATE",
        data: {
          name: "Delete Me",
          city: "City",
          entity: "FBIH",
          ownership: "JAVNA",
        },
        user: { connect: { id: user.id } },
      },
    });

    const response = await agent
      .delete("/users/contribution/pending-changes/universities")
      .send({ id: pendingChange.id });
    const pendingChangeInDb = await prisma.pendingChange.findUnique({
      where: { id: pendingChange.id },
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: null,
      message: "Pending change deleted successfully.",
    });
    expect(pendingChangeInDb).toBeNull();
  });
});
