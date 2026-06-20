import { prisma } from "../db/prisma.js";

class PendingUserModel {
  async create(data) {
    return await prisma.pendingUser.create({
      data,
    });
  }

  async update(where, data) {
    return await prisma.pendingUser.updateMany({
      where,
      data,
    });
  }

  findMany(where) {
    if (!where) {
      return prisma.pendingUser.findMany();
    }
    return prisma.pendingUser.findMany({ where });
  }

  async delete(where) {
    return await prisma.pendingUser.deleteMany({
      where,
    });
  }
}

const pendingUserModel = new PendingUserModel();

export { pendingUserModel };
