import { createNewUserInput } from "./createNewUserInput.js";
import { usersModel } from "../../models/usersModel.js";
import { pendingUserModel } from "../../models/pendingUsersModel.js";

interface CreateNewUserInputOptions {
  id?: string;
  email?: string;
  password?: string;
  role?: "USER" | "ADMIN";
  githubId?: string | null;
  "confirm-password"?: string;
}

import type { Agent } from "supertest";

async function createAndLoginUser(
  agent: Agent,
  newUser: CreateNewUserInputOptions,
) {
  const userData = createNewUserInput(newUser);

  if (!agent) throw new Error("Agent is required to create and login user.");

  await agent.post("/auth/signup").send(userData);

  const users = await pendingUserModel.findMany({
    email: userData.email,
  });
  const token = users[0].token;

  await agent.get(`/auth/confirm/${token}`);

  if (userData.role !== "USER") {
    await usersModel.update({ email: userData.email }, { role: userData.role });
  }

  const response = await agent.post("/auth/login").send({
    email: userData.email,
    password: userData.password,
  });

  return response;
}

export { createAndLoginUser };
