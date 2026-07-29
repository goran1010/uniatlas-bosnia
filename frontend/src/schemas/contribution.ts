import { z } from "zod";

import {
  durationYearsSchema,
  ectsSchema,
  entitySchema,
  entityTypeSchema,
  ownershipSchema,
  positiveIntegerSchema,
  semesterSchema,
  studyCycleSchema,
  subjectTypeSchema,
} from "./domain";

const requiredNameSchema = z.string().trim().min(1);
const optionalNameSchema = requiredNameSchema.optional();

const universityCreateDataSchema = z.strictObject({
  name: requiredNameSchema,
  city: requiredNameSchema,
  entity: entitySchema,
  ownership: ownershipSchema,
});

const facultyCreateDataSchema = z.strictObject({
  name: requiredNameSchema,
  city: requiredNameSchema.optional(),
});

const studyProgramCreateDataSchema = z.strictObject({
  name: requiredNameSchema,
  cycle: studyCycleSchema,
  durationYears: durationYearsSchema.optional(),
  ects: ectsSchema.optional(),
});

const subjectCreateDataSchema = z.strictObject({
  name: requiredNameSchema,
  semester: semesterSchema.optional(),
  ects: ectsSchema.optional(),
  type: subjectTypeSchema.optional(),
});

function nonEmptyObject<T extends z.ZodRawShape>(shape: T) {
  return z.strictObject(shape).refine((data) => Object.keys(data).length > 0);
}

const universityEditDataSchema = nonEmptyObject({
  name: optionalNameSchema,
  city: optionalNameSchema,
  entity: entitySchema.optional(),
  ownership: ownershipSchema.optional(),
});

const facultyEditDataSchema = nonEmptyObject({
  name: optionalNameSchema,
  city: requiredNameSchema.nullable().optional(),
});

const studyProgramEditDataSchema = nonEmptyObject({
  name: optionalNameSchema,
  cycle: studyCycleSchema.optional(),
  durationYears: durationYearsSchema.nullable().optional(),
  ects: ectsSchema.nullable().optional(),
});

const subjectEditDataSchema = nonEmptyObject({
  name: optionalNameSchema,
  semester: semesterSchema.nullable().optional(),
  ects: ectsSchema.nullable().optional(),
  type: subjectTypeSchema.nullable().optional(),
});

const positiveIdSchema = z
  .string()
  .trim()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .pipe(positiveIntegerSchema);

const contributionSubmissionSchema = z.union([
  z.object({
    entityType: z.literal("UNIVERSITY"),
    typeOfChange: z.literal("CREATE"),
    data: universityCreateDataSchema,
  }),
  z.object({
    entityType: z.literal("FACULTY"),
    typeOfChange: z.literal("CREATE"),
    parentId: positiveIdSchema,
    data: facultyCreateDataSchema,
  }),
  z.object({
    entityType: z.literal("STUDY_PROGRAM"),
    typeOfChange: z.literal("CREATE"),
    parentId: positiveIdSchema,
    data: studyProgramCreateDataSchema,
  }),
  z.object({
    entityType: z.literal("SUBJECT"),
    typeOfChange: z.literal("CREATE"),
    parentId: positiveIdSchema,
    data: subjectCreateDataSchema,
  }),
  z.object({
    entityType: z.literal("UNIVERSITY"),
    typeOfChange: z.literal("UPDATE"),
    targetId: positiveIdSchema,
    data: universityEditDataSchema,
  }),
  z.object({
    entityType: z.literal("FACULTY"),
    typeOfChange: z.literal("UPDATE"),
    targetId: positiveIdSchema,
    data: facultyEditDataSchema,
  }),
  z.object({
    entityType: z.literal("STUDY_PROGRAM"),
    typeOfChange: z.literal("UPDATE"),
    targetId: positiveIdSchema,
    data: studyProgramEditDataSchema,
  }),
  z.object({
    entityType: z.literal("SUBJECT"),
    typeOfChange: z.literal("UPDATE"),
    targetId: positiveIdSchema,
    data: subjectEditDataSchema,
  }),
  z.object({
    entityType: entityTypeSchema,
    typeOfChange: z.literal("DELETE"),
    targetId: positiveIdSchema,
  }),
]);

export {
  contributionSubmissionSchema,
  facultyCreateDataSchema,
  facultyEditDataSchema,
  studyProgramCreateDataSchema,
  studyProgramEditDataSchema,
  subjectCreateDataSchema,
  subjectEditDataSchema,
  universityCreateDataSchema,
  universityEditDataSchema,
};
