import { z } from "zod";

const optionalTextSchema = z
  .string()
  .nullish()
  .transform((value) => value ?? undefined);

const universitySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  acronym: optionalTextSchema,
  city: z.string().min(1),
  entity: z.enum(["FBIH", "RS", "BD"]),
  ownership: z.enum(["JAVNA", "PRIVATNA"]),
  foundedYear: optionalTextSchema,
  website: optionalTextSchema,
  accreditationFrom: optionalTextSchema,
  accreditationTo: optionalTextSchema,
  authority: optionalTextSchema,
  sourceUrl: optionalTextSchema,
  lastChecked: optionalTextSchema,
});

const subjectSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  studyProgramId: z.number().int().positive(),
  semester: z
    .number()
    .int()
    .nullish()
    .transform((value) => value ?? undefined),
  ects: z
    .number()
    .int()
    .nullish()
    .transform((value) => value ?? undefined),
  type: z
    .enum(["MANDATORY", "ELECTIVE"])
    .nullish()
    .transform((value) => value ?? undefined),
  sourceUrl: optionalTextSchema,
});

const studyProgramSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  facultyId: z.number().int().positive(),
  cycle: z.enum(["FIRST", "SECOND", "THIRD"]),
  durationYears: z
    .number()
    .int()
    .nullish()
    .transform((value) => value ?? undefined),
  ects: z
    .number()
    .int()
    .nullish()
    .transform((value) => value ?? undefined),
  language: optionalTextSchema,
  sourceUrl: optionalTextSchema,
  subjects: z.array(subjectSchema),
});

const facultySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  universityId: z.number().int().positive(),
  city: optionalTextSchema,
  website: optionalTextSchema,
  studyPrograms: z.array(studyProgramSchema),
});

const universityListItemSchema = universitySchema.transform((university) => ({
  ...university,
  faculties: [],
}));

const universityDetailSchema = universitySchema.extend({
  faculties: z.array(facultySchema),
});

const universityListResponseSchema = z.object({
  message: z.string(),
  data: z.array(universityListItemSchema),
});

const universityDetailResponseSchema = z.object({
  message: z.string(),
  data: universityDetailSchema,
});

export type UniversityDetail = z.infer<typeof universityDetailSchema>;
export type UniversityDetailFaculty = UniversityDetail["faculties"][number];
export type UniversityDetailStudyProgram =
  UniversityDetailFaculty["studyPrograms"][number];
export type UniversityDetailSubject =
  UniversityDetailStudyProgram["subjects"][number];
export { universityDetailResponseSchema, universityListResponseSchema };
