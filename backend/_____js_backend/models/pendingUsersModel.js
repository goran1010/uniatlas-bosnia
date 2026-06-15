import { prisma } from "../db/prisma.js";

class PendingUserModel {
  async create(data) {
    return await prisma.pendingUser.create({
      data,
    });
  }

  async update(query, data) {
    return await prisma.pendingUser.updateMany({
      where: query,
      data,
    });
  }

  findMany(where) {
    if (!where) {
      return prisma.pendingUser.findMany();
    }
    return prisma.pendingUser.findMany({ where: { ...where } });
  }

  async delete(query) {
    return await prisma.pendingUser.deleteMany({
      where: query,
    });
  }
}

const pendingUserModel = new PendingUserModel();

export { pendingUserModel };
