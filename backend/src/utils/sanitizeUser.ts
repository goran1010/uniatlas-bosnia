import type { User as PrismaUser } from "../generated/prisma/client.js";

function sanitizeUser(user: PrismaUser): Omit<PrismaUser, "password"> {
  if (!user) {
    return user;
  }
  const { id, role, email, githubId } = user;
  return { id, role, email, githubId };
}

function sanitizeUsers(
  users: PrismaUser[] = [],
): Omit<PrismaUser, "password">[] {
  return users.map((user) => sanitizeUser(user));
}

export { sanitizeUser, sanitizeUsers };
