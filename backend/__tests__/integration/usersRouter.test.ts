import request from "supertest";
import { describe, test, expect } from "vitest";
import { app } from "../../src/app.js";
import { createAndLoginUser } from "../utils/createUserAndLogin.js";
import { createNewUserInput } from "../utils/createNewUserInput.js";

function getResponseObject(body: unknown): Record<string, unknown> {
  expect(body).toBeTypeOf("object");
  expect(body).not.toBeNull();

  return body as Record<string, unknown>;
}

describe("usersRouter", () => {
  test("successfully create a user and returns status 201 and message", async () => {
    const newUserData = createNewUserInput();

    const response = await request(app).post("/auth/signup").send(newUserData);
    const responseBody = getResponseObject(response.body);

    expect(response.status).toBe(201);
    expect(responseBody["message"]).toBe(
      "Registration successful! Check your email.",
    );
    expect(responseBody["data"]).toBeTypeOf("object");
  });

  test("responds with 200 and User test_user logged in successfully for correct login input", async () => {
    const agent = request.agent(app);
    const newUserData = createNewUserInput();

    const response = await createAndLoginUser(agent, newUserData);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Logged in successfully",
      }),
    );
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
