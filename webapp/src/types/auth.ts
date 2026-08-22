export type UserData = {
  email: string;
  role: "ADMIN" | "USER";
  adminRequestedAt?: string | null;
} | null;
