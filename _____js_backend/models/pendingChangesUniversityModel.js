import { prisma } from "../db/prisma.js";

class PendingChangesUniversityModel {
  create(data) {
    return prisma.pendingChangesUniversity.create({ data });
  }

  findMany(where) {
    return prisma.pendingChangesUniversity.findMany({
      where: where ? { ...where } : undefined,
      include: {
        user: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  delete(where) {
    return prisma.pendingChangesUniversity.delete({ where: { ...where } });
  }

  update(where, data) {
    return prisma.pendingChangesUniversity.update({
      where: { ...where },
      data: { ...data },
    });
  }
}

const pendingChangesUniversityModel = new PendingChangesUniversityModel();

export { pendingChangesUniversityModel };
