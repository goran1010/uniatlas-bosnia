import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";

class PendingUserModel {
  async create(data: Prisma.PendingUserCreateInput) {
    return await prisma.pendingUser.create({
      data,
    });
  }

  async update(
    where: Prisma.PendingUserWhereInput,
    data: Prisma.PendingUserUpdateInput,
  ) {
    return await prisma.pendingUser.updateMany({
      where,
      data,
    });
  }

  findMany(where?: Prisma.PendingUserWhereInput) {
    if (!where) {
      return prisma.pendingUser.findMany();
    }
    return prisma.pendingUser.findMany({ where });
  }

  async delete(where: Prisma.PendingUserWhereInput) {
    return await prisma.pendingUser.deleteMany({
      where,
    });
  }
}

const pendingUserModel = new PendingUserModel();

export { pendingUserModel };
