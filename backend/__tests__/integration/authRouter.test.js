import request from "supertest";
import { describe, test, expect } from "vitest";
import { app } from "../../app.js";
import { createNewUser } from "../utils/createNewUser.js";
import { emailConfirmHTML } from "../../utils/emailConfirmHTML.js";
import { pendingUserModel } from "../../models/pendingUsersModel.js";

describe("Auth Router - POST /auth/signup", () => {
  test("responds with status 201 and Registration successful! Check your email message if user created successfully", async () => {
    const newUser = createNewUser();

    const expectedResponse = {
      status: 201,
      body: {
        data: expect.any(Object),
        message: "Registration successful! Check your email.",
      },
    };
    const response = await request(app).post("/auth/signup").send(newUser);

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});

describe("Auth Router - GET /auth/confirm/:token", () => {
  test("responds with status 200 and Email confirmed successfully message if token is valid", async () => {
    const agent = request.agent(app);
    const newUser = createNewUser();
    await agent.post("/auth/signup").send(newUser);

    const users = await pendingUserModel.findMany({
      email: newUser.email,
    });
    const token = users[0].token;

    const response = await agent.get(`/auth/confirm/${token}`);
    const expectedResponse = {
      status: 200,
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
    expect(response.text).toContain(emailConfirmHTML());
  });
});

describe("Auth Router - POST /auth/login", () => {
  test("responds with status 200 and access token if login is successful", async () => {
    const agent = request.agent(app);
    const newUser = createNewUser();
    await agent.post("/auth/signup").send(newUser);

    const users = await pendingUserModel.findMany({
      email: newUser.email,
    });
    const token = users[0].token;

    await agent.get(`/auth/confirm/${token}`);

    const response = await agent.post("/auth/login").send({
      email: newUser.email,
      password: newUser.password,
    });
    const expectedResponse = {
      status: 200,
      body: expect.objectContaining({
        message: "Logged in successfully",
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});
