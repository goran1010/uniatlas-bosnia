/* eslint-disable no-console */
import { usersModel } from "../../models/usersModel.js";
import { pendingUserModel } from "../../models/pendingUsersModel.js";
import { prisma } from "../../db/prisma.js";
import { pendingChangesPostalCodeModel } from "../../models/pendingChangesPostalCodeModel.js";

export default async function () {
  process.env.NODE_ENV = "test";

  await pendingChangesPostalCodeModel.delete();
  await usersModel.deleteAll();
  await pendingUserModel.delete();
  await prisma.session.deleteMany();
  console.log("Test database cleared before tests");

  return async () => {
    console.log("Global teardown: Test database cleared after tests");
    await pendingChangesPostalCodeModel.delete();
    await usersModel.deleteAll();
    await pendingUserModel.delete();
    await prisma.session.deleteMany();
  };
}
