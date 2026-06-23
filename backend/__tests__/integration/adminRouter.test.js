import request from "supertest";
import { describe, test, expect } from "vitest";
import { app } from "../../src/app.js";
import { createAndLoginUser } from "../utils/createUserAndLogin.js";
import { createNewUserInput } from "../utils/createNewUserInput.js";
import { usersModel } from "../../src/models/usersModel.js";
import { pendingChangesUniversityModel } from "../../src/models/pendingChangesUniversityModel.js";
import { universitiesModel } from "../../src/models/universitiesModel.js";

describe("Admin Router - GET /users/admin/pending-changes", () => {
  test("Responds with status 200 and all pending changes if role ADMIN", async () => {
    const userRequested = createNewUserInput({ role: "ADMIN" });
    delete userRequested["confirm-password"];

    const userInDb = await usersModel.create(userRequested);

    const pendingChange = await pendingChangesUniversityModel.create({
      userId: userInDb.id,
      entityType: "UNIVERSITY",
      typeOfChange: "CREATE",
      data: {
        name: "Test Admin GET University",
        city: "Test City",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent.get("/users/admin/pending-changes");
    const expectedResponse = {
      status: 200,
      body: expect.objectContaining({
        message: "Pending changes retrieved successfully.",
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));

    await pendingChangesUniversityModel.delete({ id: pendingChange.id });
    await usersModel.deleteUser({ id: userInDb.id });
  });
});

describe("Admin Router - DELETE /users/admin/decline-pending-change", () => {
  test("Responds with status 200 if role ADMIN", async () => {
    const userRequested = createNewUserInput({ role: "ADMIN" });
    delete userRequested["confirm-password"];

    const userInDb = await usersModel.create(userRequested);

    const pendingChange = await pendingChangesUniversityModel.create({
      userId: userInDb.id,
      entityType: "UNIVERSITY",
      typeOfChange: "CREATE",
      data: {
        name: "Test Decline University",
        city: "Test City",
        entity: "FBIH",
        ownership: "JAVNA",
      },
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .delete("/users/admin/decline-pending-change")
      .send({
        id: pendingChange.id,
      });
    const expectedResponse = {
      status: 200,
      body: expect.objectContaining({
        message: "Pending change declined successfully.",
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));

    await usersModel.deleteUser({ id: userInDb.id });
  });
});

describe("Admin Router - POST /users/admin/approve-pending-change", () => {
  test("Responds with status 200 and message if a pending change is approved successfully", async () => {
    const userRequested = createNewUserInput({ role: "ADMIN" });
    delete userRequested["confirm-password"];

    const userInDb = await usersModel.create(userRequested);

    const university = await universitiesModel.createUniversity({
      name: "Test Approve University",
      city: "Test City",
      entity: "FBIH",
      ownership: "JAVNA",
    });

    const pendingChange = await pendingChangesUniversityModel.create({
      userId: userInDb.id,
      entityType: "UNIVERSITY",
      typeOfChange: "DELETE",
      targetId: university.id,
      data: {},
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .post("/users/admin/approve-pending-change")
      .send({
        id: pendingChange.id,
        entityType: "UNIVERSITY",
        typeOfChange: "DELETE",
      });
    const expectedResponse = {
      status: 200,
      body: {
        data: null,
        message: "Pending change approved successfully.",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));

    await usersModel.deleteUser({ id: userInDb.id });
  });
});
