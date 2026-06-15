import { createNewUser } from "./createNewUser";
import { usersModel } from "../../models/usersModel.js";
import { pendingUserModel } from "../../models/pendingUsersModel.js";

async function createAndLoginUser(agent, newUser) {
  const userData = createNewUser(newUser);

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

  if (userData.requestedContributor === true) {
    await usersModel.update(
      { email: userData.email },
      { requestedContributor: true },
    );
  }

  const response = await agent.post("/auth/login").send({
    email: userData.email,
    password: userData.password,
  });

  return response;
}

export { createAndLoginUser };
