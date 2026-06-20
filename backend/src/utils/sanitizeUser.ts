type Role = "ADMIN" | "USER";

interface User {
  id: string;
  role: Role;
  email: string;
  githubId: string | null;
}

function sanitizeUser(
  user: User | null,
): Omit<User, "password" | "githubId"> | null {
  if (!user) {
    return null;
  }

  const { id, role, email } = user;
  return { id, role, email };
}

function sanitizeUsers(
  users: User[] = [],
): (Omit<User, "password" | "githubId"> | null)[] {
  return users.map((user) => sanitizeUser(user));
}

export { sanitizeUser, sanitizeUsers };
