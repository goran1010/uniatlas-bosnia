import { prisma } from "../db/prisma.js";
import type { User, Prisma } from "../generated/prisma/client.js";

class UsersModel {
  findOne(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return prisma.user.findUnique({ where });
  }

  findMany(where?: Prisma.UserWhereInput): Promise<User[]> {
    if (!where) {
      return prisma.user.findMany();
    }
    return prisma.user.findMany({ where });
  }

  update(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ): Promise<User> {
    return prisma.user.update({
      where,
      data,
    });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  deleteAll(): Promise<Prisma.BatchPayload> {
    return prisma.user.deleteMany();
  }

  deleteUser(where: Prisma.UserWhereInput): Promise<Prisma.BatchPayload> {
    return prisma.user.deleteMany({
      where,
    });
  }
}

const usersModel = new UsersModel();

export { usersModel };
