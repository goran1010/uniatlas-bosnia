import type { User as PrismaUser } from "#generated/prisma/client.js";

declare global {
  namespace Express {
    interface User {
      id: PrismaUser["id"];
      email: PrismaUser["email"];
      role: PrismaUser["role"];
      githubId: PrismaUser["githubId"];
    }
  }
}

export {};
