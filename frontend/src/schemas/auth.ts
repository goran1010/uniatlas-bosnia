import { z } from "zod";

const signupResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    email: z.email(),
  }),
});

const loginResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    email: z.email(),
    role: z.enum(["ADMIN", "USER"]),
  }),
});

const csrfTokenResponseSchema = z.object({
  message: z.string(),
  data: z.string().min(1),
});

export { signupResponseSchema, loginResponseSchema, csrfTokenResponseSchema };
