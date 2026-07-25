import { z } from "zod";

import {
  facultyCreateDataSchema,
  facultyEditDataSchema,
  studyProgramCreateDataSchema,
  studyProgramEditDataSchema,
  subjectCreateDataSchema,
  subjectEditDataSchema,
  universityCreateDataSchema,
  universityEditDataSchema,
} from "./contribution";

const positiveIdSchema = z.number().int().positive();

const pendingChangeUserSchema = z.object({
  email: z.email(),
  role: z.enum(["ADMIN", "USER"]),
});

const pendingChangeBaseSchema = z.object({
  id: z.string().min(1),
  userId: z.string(),
  user: pendingChangeUserSchema.nullable().optional(),
  createdAt: z.coerce.date(),
});

const pendingChangeSchema = z.union([
  pendingChangeBaseSchema.extend({
    entityType: z.literal("UNIVERSITY"),
    typeOfChange: z.literal("CREATE"),
    targetId: z.null(),
    parentId: z.null(),
    data: universityCreateDataSchema,
  }),
  pendingChangeBaseSchema.extend({
    entityType: z.literal("FACULTY"),
    typeOfChange: z.literal("CREATE"),
    targetId: z.null(),
    parentId: positiveIdSchema,
    data: facultyCreateDataSchema,
  }),
  pendingChangeBaseSchema.extend({
    entityType: z.literal("STUDY_PROGRAM"),
    typeOfChange: z.literal("CREATE"),
    targetId: z.null(),
    parentId: positiveIdSchema,
    data: studyProgramCreateDataSchema,
  }),
  pendingChangeBaseSchema.extend({
    entityType: z.literal("SUBJECT"),
    typeOfChange: z.literal("CREATE"),
    targetId: z.null(),
    parentId: positiveIdSchema,
    data: subjectCreateDataSchema,
  }),
  pendingChangeBaseSchema.extend({
    entityType: z.literal("UNIVERSITY"),
    typeOfChange: z.literal("UPDATE"),
    targetId: positiveIdSchema,
    parentId: z.null(),
    data: universityEditDataSchema,
  }),
  pendingChangeBaseSchema.extend({
    entityType: z.literal("FACULTY"),
    typeOfChange: z.literal("UPDATE"),
    targetId: positiveIdSchema,
    parentId: z.null(),
    data: facultyEditDataSchema,
  }),
  pendingChangeBaseSchema.extend({
    entityType: z.literal("STUDY_PROGRAM"),
    typeOfChange: z.literal("UPDATE"),
    targetId: positiveIdSchema,
    parentId: z.null(),
    data: studyProgramEditDataSchema,
  }),
  pendingChangeBaseSchema.extend({
    entityType: z.literal("SUBJECT"),
    typeOfChange: z.literal("UPDATE"),
    targetId: positiveIdSchema,
    parentId: z.null(),
    data: subjectEditDataSchema,
  }),
  pendingChangeBaseSchema.extend({
    entityType: z.enum(["UNIVERSITY", "FACULTY", "STUDY_PROGRAM", "SUBJECT"]),
    typeOfChange: z.literal("DELETE"),
    targetId: positiveIdSchema,
    parentId: z.null(),
    data: z.strictObject({}),
  }),
]);

const adminPendingChangeSchema = pendingChangeSchema.and(
  z.object({ user: pendingChangeUserSchema }),
);

const pendingChangesResponseSchema = z.object({
  message: z.string(),
  data: z.array(pendingChangeSchema),
});

const adminPendingChangesResponseSchema = z.object({
  message: z.string(),
  data: z.array(adminPendingChangeSchema),
});

const pendingChangeResponseSchema = z.object({
  message: z.string(),
  data: pendingChangeSchema,
});

export type PendingChange = z.infer<typeof pendingChangeSchema>;
export {
  adminPendingChangesResponseSchema,
  pendingChangeSchema,
  pendingChangeResponseSchema,
  pendingChangesResponseSchema,
};
