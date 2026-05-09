import request from "supertest";
import { describe, test, expect } from "vitest";
import { app } from "../../app.js";
import { createAndLoginUser } from "../utils/createUserAndLogin.js";
import { createNewUser } from "../utils/createNewUser.js";
import { usersModel } from "../../models/usersModel.js";
import { pendingChangesPostalCodeModel } from "../../models/pendingChangesPostalCodeModel.js";

describe("Admin Router - GET /users/admin/pending-changes", () => {
  test("Responds with status 200 and all pending changes if role ADMIN", async () => {
    // eslint-disable-next-line no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      createNewUser({ role: "ADMIN" });

    const userInDb = await usersModel.create(userRequested);

    await pendingChangesPostalCodeModel.create({
      city: "Test City",
      code: 1234,
      userId: userInDb.id,
      typeOfChange: "CREATE",
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent.get("/users/admin/pending-changes");

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(
      "Pending changes retrieved successfully.",
    );

    await pendingChangesPostalCodeModel.delete({ code: 1234 });
    await usersModel.deleteUser({ id: userInDb.id });
  });
});

describe("Admin Router - DELETE /users/admin/decline-pending-change", () => {
  test("Responds with status 200 if role ADMIN", async () => {
    // eslint-disable-next-line no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      createNewUser({ role: "ADMIN" });

    const userInDb = await usersModel.create(userRequested);

    await pendingChangesPostalCodeModel.create({
      city: "Test City",
      code: 1234,
      userId: userInDb.id,
      typeOfChange: "CREATE",
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .delete("/users/admin/decline-pending-change")
      .send({
        id: "1234",
      });

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual(
      "Pending change declined successfully.",
    );

    await pendingChangesPostalCodeModel.delete({ code: 1234 });
    await usersModel.deleteUser({ id: userInDb.id });
  });
});

describe("Admin Router - POST /users/admin/approve-pending-change", () => {
  test("Responds with status 200 and message if a pending change is approved successfully", async () => {
    // eslint-disable-next-line no-unused-vars
    const { ["confirm-password"]: confirmPassword, ...userRequested } =
      createNewUser({ role: "ADMIN" });

    const userInDb = await usersModel.create(userRequested);

    const pendingChange = await pendingChangesPostalCodeModel.create({
      city: "Test City",
      code: 1234,
      userId: userInDb.id,
      typeOfChange: "DELETE",
    });

    const agent = request.agent(app);
    await createAndLoginUser(agent, { role: "ADMIN" });

    const response = await agent
      .post("/users/admin/approve-pending-change")
      .send({
        id: pendingChange.id,
        typeOfChange: "DELETE",
      });

    expect(response.header["content-type"]).toMatch(/json/);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: null,
      message: "Pending change approved successfully.",
    });

    await pendingChangesPostalCodeModel.delete({ code: 1234 });
    await usersModel.deleteUser({ id: userInDb.id });
  });
});
