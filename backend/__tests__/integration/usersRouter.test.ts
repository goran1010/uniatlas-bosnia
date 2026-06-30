import request from "supertest";
import { describe, test, expect } from "vitest";
import { app } from "../../src/app.js";
import { createAndLoginUser } from "../utils/createUserAndLogin.js";
import { createNewUserInput } from "../utils/createNewUserInput.js";

describe("usersRouter", () => {
  test("successfully create a user and returns status 201 and message", async () => {
    const expectedResponse = {
      status: 201,
      body: {
        data: expect.any(Object),
        message: "Registration successful! Check your email.",
      },
    };

    const newUserData = createNewUserInput();

    const response = await request(app).post("/auth/signup").send(newUserData);

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("responds with 200 and User test_user logged in successfully for correct login input", async () => {
    const agent = request.agent(app);
    const newUserData = createNewUserInput();

    const response = await createAndLoginUser(agent, newUserData);
    const expectedResponse = {
      status: 200,
      body: expect.objectContaining({
        message: "Logged in successfully",
      }),
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });

  test("responds User logged out successfully", async () => {
    const agent = request.agent(app);
    const userData = createNewUserInput();
    await createAndLoginUser(agent, userData);

    const response = await agent.post("/users/logout");
    const expectedResponse = {
      status: 200,
      body: {
        data: {
          success: true,
        },
        message: "User logged out successfully",
      },
    };

    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});
