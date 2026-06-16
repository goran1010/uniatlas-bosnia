type Role = "ADMIN" | "USER";

interface User {
  id: number;
  role: Role;
  email: string;
  password: string;
  githubId?: number;
}

function sanitizeUser(user: User | null): Pick<User, "role" | "email"> | null {
  if (!user) {
    return null;
  }

  const { role, email } = user;
  return { role, email };
}

function sanitizeUsers(
  users: User[] = [],
): (Pick<User, "role" | "email"> | null)[] {
  return users.map((user) => sanitizeUser(user));
}

export { sanitizeUser, sanitizeUsers };
