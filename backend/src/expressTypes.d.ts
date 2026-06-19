declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
      githubId?: string | null;
    }
  }
}

export {};
