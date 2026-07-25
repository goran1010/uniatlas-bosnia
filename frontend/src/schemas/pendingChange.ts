import { z } from "zod";

const contributionDataSchema = z.looseObject({
  name: z.string().optional(),
  city: z.string().nullable().optional(),
  entity: z.enum(["FBIH", "RS", "BD"]).optional(),
  ownership: z.enum(["JAVNA", "PRIVATNA"]).optional(),
  website: z.string().nullable().optional(),
  cycle: z.enum(["FIRST", "SECOND", "THIRD"]).optional(),
  durationYears: z.number().int().nullable().optional(),
  ects: z.number().int().nullable().optional(),
  language: z.string().nullable().optional(),
  semester: z.number().int().nullable().optional(),
  type: z.enum(["MANDATORY", "ELECTIVE"]).nullable().optional(),
  email: z.string().optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
});

const pendingChangeSchema = z.object({
  id: z.string().min(1),
  entityType: z.enum(["UNIVERSITY", "FACULTY", "STUDY_PROGRAM", "SUBJECT"]),
  typeOfChange: z.enum(["CREATE", "UPDATE", "DELETE"]),
  targetId: z.number().int().nullable(),
  parentId: z.number().int().nullable(),
  data: contributionDataSchema.nullable(),
  userId: z.string(),
  user: z
    .object({
      email: z.email(),
      role: z.enum(["ADMIN", "USER"]),
    })
    .nullable()
    .optional(),
  createdAt: z.coerce.date(),
});

const pendingChangesResponseSchema = z.object({
  message: z.string(),
  data: z.array(pendingChangeSchema),
});

const pendingChangeResponseSchema = z.object({
  message: z.string(),
  data: pendingChangeSchema,
});

export type PendingChange = z.infer<typeof pendingChangeSchema>;
export {
  pendingChangeSchema,
  pendingChangeResponseSchema,
  pendingChangesResponseSchema,
};
