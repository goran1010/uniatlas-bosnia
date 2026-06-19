import { prisma } from "../db/prisma.js";

interface FindUniqueWhere {
  id: string;
}

interface FindManyWhere {
  entityType?: "UNIVERSITY" | "FACULTY" | "STUDY_PROGRAM" | "SUBJECT";
  typeOfChange?: "CREATE" | "UPDATE" | "DELETE";
  userId?: string;
  id?: string;
}

class PendingChangesUniversityModel {
  create(data) {
    return prisma.pendingChangesUniversity.create({ data });
  }

  findMany(where: FindManyWhere | undefined = undefined) {
    if (!where) {
      return prisma.pendingChangesUniversity.findMany({
        include: {
          user: {
            select: { email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }
    return prisma.pendingChangesUniversity.findMany({
      where,
      include: {
        user: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  delete(where: FindUniqueWhere) {
    return prisma.pendingChangesUniversity.delete({ where });
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
