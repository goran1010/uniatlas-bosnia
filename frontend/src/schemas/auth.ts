import { z } from "zod";

import { userRoleSchema } from "./domain";

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
    role: userRoleSchema,
  }),
});

const currentUserResponseSchema = z.object({
  message: z.string().nullable(),
  data: z
    .object({
      email: z.email(),
      role: userRoleSchema,
    })
    .nullable(),
});

const csrfTokenResponseSchema = z.object({
  message: z.string(),
  data: z.string().min(1),
});

export {
  signupResponseSchema,
  loginResponseSchema,
  currentUserResponseSchema,
  csrfTokenResponseSchema,
};
