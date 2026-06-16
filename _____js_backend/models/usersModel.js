import { prisma } from "../db/prisma.js";

class UsersModel {
  findOne(where) {
    return prisma.user.findUnique({ where: { ...where } });
  }

  findMany(where) {
    if (!where) {
      return prisma.user.findMany();
    }
    return prisma.user.findMany({ where: { ...where } });
  }

  update(where, data) {
    return prisma.user.update({
      where: { ...where },
      data: { ...data },
    });
  }

  create(data) {
    return prisma.user.create({
      data: {
        ...data,
      },
    });
  }

  deleteAll() {
    return prisma.user.deleteMany();
  }

  deleteUser(where) {
    return prisma.user.deleteMany({
      where: { ...where },
    });
  }
}

const usersModel = new UsersModel();

export { usersModel };
