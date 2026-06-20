declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: "ADMIN" | "USER";
      githubId: string | null;
    }
  }
}

export {};
