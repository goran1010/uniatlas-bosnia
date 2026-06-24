interface UserInput {
  id?: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
  githubId: string | null;
  "confirm-password": string;
}

interface CreateNewUserInputOptions {
  id?: string;
  email?: string;
  password?: string;
  role?: "USER" | "ADMIN";
  githubId?: string | null;
  "confirm-password"?: string;
}

function createNewUserInput(user: CreateNewUserInputOptions = {}) {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 10000);

  const newUser: UserInput = {
    id: user.id || `${timestamp}_${randomSuffix}`,
    email:
      user.email ||
      `test_user_${timestamp}_${randomSuffix}@non-existent-mail.comms`,
    password: user.password || "123123",
    role: user.role || "USER",
    githubId: user.githubId || null,
    "confirm-password": user["confirm-password"] || "123123",
  };

  return newUser;
}

export { createNewUserInput };
