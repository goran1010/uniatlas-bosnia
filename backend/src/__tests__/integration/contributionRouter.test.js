import request from "supertest";
import { describe, test, expect } from "vitest";
import { app } from "../../src/app.js";
import { createAndLoginUser } from "../utils/createUserAndLogin.js";
import { pendingChangesUniversityModel } from "../../src/models/pendingChangesUniversityModel.js";
import { usersModel } from "../../src/models/usersModel.js";

describe("Contributor Router - POST /users/contribution/universities", () => {
  test("Responds with status 201 and message if suggestion created successfully", async () => {
    const agent = request.agent(app);
    const loginResponse = await createAndLoginUser(agent);

    const response = await agent.post("/users/contribution/universities").send({
      entityType: "UNIVERSITY",
      data: {
        name: "Test Integration POST University",
        city: "Test City",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });
    const expectedResponse = {
      status: 201,
      body: expect.objectContaining({
        message: "Suggestion submitted. An admin will review it.",
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));

    const pendingChanges = await pendingChangesUniversityModel.findMany({
      userId: loginResponse.body.data.id,
    });
    for (const pc of pendingChanges) {
      await pendingChangesUniversityModel.delete({ id: pc.id });
    }
    await usersModel.deleteUser({ id: loginResponse.body.data.id });
  });
});

describe("Contributor Router - PUT /users/contribution/universities", () => {
  test("Responds with status 201 and message if edit suggestion added successfully", async () => {
    const agent = request.agent(app);
    const loginResponse = await createAndLoginUser(agent);

    const response = await agent.put("/users/contribution/universities").send({
      entityType: "UNIVERSITY",
      targetId: 1,
      data: { name: "Updated University Name" },
    });
    const expectedResponse = {
      status: 201,
      body: expect.objectContaining({
        message: "Edit suggestion submitted. An admin will review it.",
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));

    const pendingChanges = await pendingChangesUniversityModel.findMany({
      userId: loginResponse.body.data.id,
    });
    for (const pc of pendingChanges) {
      await pendingChangesUniversityModel.delete({ id: pc.id });
    }
    await usersModel.deleteUser({ id: loginResponse.body.data.id });
  });
});

describe("Contributor Router - DELETE /users/contribution/universities", () => {
  test("Responds with status 201 and message if deletion suggestion added successfully", async () => {
    const agent = request.agent(app);
    const loginResponse = await createAndLoginUser(agent);

    const response = await agent
      .delete("/users/contribution/universities")
      .send({
        entityType: "UNIVERSITY",
        targetId: 1,
      });
    const expectedResponse = {
      status: 201,
      body: expect.objectContaining({
        message: "Deletion suggestion submitted. An admin will review it.",
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));

    const pendingChanges = await pendingChangesUniversityModel.findMany({
      userId: loginResponse.body.data.id,
    });
    for (const pc of pendingChanges) {
      await pendingChangesUniversityModel.delete({ id: pc.id });
    }
    await usersModel.deleteUser({ id: loginResponse.body.data.id });
  });
});

describe("Contributor Router - GET /users/contribution/pending-changes/universities", () => {
  test("Responds with status 200 and message if pending changes retrieved successfully", async () => {
    const agent = request.agent(app);
    const loginResponse = await createAndLoginUser(agent);

    const response = await agent.get(
      "/users/contribution/pending-changes/universities",
    );
    const expectedResponse = {
      status: 200,
      body: expect.objectContaining({
        message: "Pending changes retrieved successfully.",
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));

    await usersModel.deleteUser({ id: loginResponse.body.data.id });
  });
});

describe("Contributor Router - DELETE /users/contribution/pending-changes/universities", () => {
  test("Responds with status 200 and message if pending change deleted successfully", async () => {
    const agent = request.agent(app);
    const loginResponse = await createAndLoginUser(agent);

    const user = await usersModel.findMany({
      email: loginResponse.body.data.email,
    });
    const pendingChange = await pendingChangesUniversityModel.create({
      userId: user[0].id,
      entityType: "UNIVERSITY",
      typeOfChange: "CREATE",
      data: {
        name: "Test Delete Pending University",
        city: "Test City",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });

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

    await usersModel.deleteUser({ id: loginResponse.body.data.id });
  });
});
