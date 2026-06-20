import { prisma } from "../db/prisma.js";
import type { Prisma } from "#generated/prisma/client.js";

class PendingChangesModel {
  create(data: Prisma.PendingChangeCreateInput) {
    return prisma.pendingChange.create({ data });
  }

  findMany(where: Prisma.PendingChangeWhereInput | undefined = undefined) {
    if (!where) {
      return prisma.pendingChange.findMany({
        include: {
          user: {
            select: { email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }
    return prisma.pendingChange.findMany({
      where,
      include: {
        user: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  delete(where: Prisma.PendingChangeWhereUniqueInput) {
    return prisma.pendingChange.delete({ where });
  }

  update(
    where: Prisma.PendingChangeWhereUniqueInput,
    data: Prisma.PendingChangeUpdateInput,
  ) {
    return prisma.pendingChange.update({
      where,
      data,
    });
  }
}

const pendingChangesModel = new PendingChangesModel();

export { pendingChangesModel };
