import request from "supertest";
import { describe, test, expect } from "vitest";
import { app } from "../../app.js";
import { createAndLoginUser } from "../utils/createUserAndLogin.js";
import { postalCodesModel } from "../../models/postalCodesModel.js";
import { pendingChangesPostalCodeModel } from "../../models/pendingChangesPostalCodeModel.js";
import { usersModel } from "../../models/usersModel.js";

describe("Contributor Router - POST /users/contribution/postal-codes", () => {
  test("Responds with status 201 and message if pending changes created successfully", async () => {
    await pendingChangesPostalCodeModel.delete({ code: 12345 });

    const agent = request.agent(app);
    const loginResponse = await createAndLoginUser(agent);
    const newPostalCode = { city: "Test", code: "12345", post: "BH_POSTA" };

    const response = await agent
      .post("/users/contribution/postal-codes")
      .send(newPostalCode);

    expect(response.header["content-type"]).toMatch(/json/);

    expect(response.body.message).toBe(
      "New postal code suggested. Admin will review the suggestion and decide whether to accept it or not.",
    );
    expect(response.status).toBe(201);

    await pendingChangesPostalCodeModel.delete({ code: 12345 });
    await usersModel.deleteUser({ id: loginResponse.body.data.id });
  });
});

describe("Contributor Router - PUT  /users/contribution/postal-codes", () => {
  test("Responds with status 201 and message if pending change edit added successfully", async () => {
    await pendingChangesPostalCodeModel.delete({ code: 12345 });
    await postalCodesModel.deleteCode(12345);

    const agent = request.agent(app);
    const loginResponse = await createAndLoginUser(agent);

    await postalCodesModel.createNew("Test", "12345", "BH_POSTA");

    const editedPostalCode = {
      city: "Edited Test",
      code: "12345",
      post: "HP_MOSTAR",
    };

    const response = await agent
      .put("/users/contribution/postal-codes")
      .send(editedPostalCode);

    expect(response.header["content-type"]).toMatch(/json/);

    expect(response.body.message).toBe(
      "Postal code edit suggested. Admin will review the suggestion and decide whether to accept it or not.",
    );
    expect(response.status).toBe(201);

    await pendingChangesPostalCodeModel.delete({ code: 12345 });
    await usersModel.deleteUser({ id: loginResponse.body.data.id });
  });
});

describe("Contributor Router - DELETE /users/contribution/postal-codes", () => {
  test("Responds with status 200 and message if pending change deletion added successfully", async () => {
    await pendingChangesPostalCodeModel.delete({ code: 12345 });

    const agent = request.agent(app);
    const loginResponse = await createAndLoginUser(agent);

    const response = await agent
      .delete("/users/contribution/postal-codes")
      .send({ code: "12345", city: "Test", post: "BH_POSTA" });

    expect(response.header["content-type"]).toMatch(/json/);

    expect(response.body.message).toBe(
      "Postal code deletion suggested. Admin will review the suggestion and decide whether to accept it or not.",
    );
    expect(response.status).toBe(200);

    await pendingChangesPostalCodeModel.delete({ code: 12345 });
    await usersModel.deleteUser({ id: loginResponse.body.data.id });
  });
});

describe("Contributor Router - GET /users/contribution/pending-changes/postal-codes", () => {
  test("Responds with status 200 and message if pending changes retrieved successfully", async () => {
    const agent = request.agent(app);
    const loginResponse = await createAndLoginUser(agent);

    const response = await agent.get(
      "/users/contribution/pending-changes/postal-codes",
    );

    expect(response.header["content-type"]).toMatch(/json/);

    expect(response.body.message).toBe(
      "Pending changes retrieved successfully.",
    );
    expect(response.status).toBe(200);

    await usersModel.deleteUser({ id: loginResponse.body.data.id });
  });
});

describe("Contributor Router - DELETE /users/contribution/pending-changes/postal-codes", () => {
  test("Responds with status 200 and message if pending change deleted successfully", async () => {
    const agent = request.agent(app);
    const loginResponse = await createAndLoginUser(agent);

    const pendingChange = await pendingChangesPostalCodeModel.create({
      userId: loginResponse.body.data.id,
      code: 12345,
      typeOfChange: "CREATE",
      city: "Test",
      post: "BH_POSTA",
    });

    const response = await agent
      .delete("/users/contribution/pending-changes/postal-codes")
      .send({ id: pendingChange.id });

    expect(response.header["content-type"]).toMatch(/json/);

    expect(response.body.message).toBe("Pending change deleted successfully.");
    expect(response.status).toBe(200);

    await usersModel.deleteUser({ id: loginResponse.body.data.id });
  });
});
