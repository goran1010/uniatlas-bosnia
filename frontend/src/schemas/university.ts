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

const universityListItemSchema = universitySchema;

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

const studyProgramSearchResultSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  facultyId: z.number().int().positive(),
  cycle: z.enum(["FIRST", "SECOND", "THIRD"]),
  ects: z
    .number()
    .int()
    .nullish()
    .transform((value) => value ?? undefined),
  faculty: z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    universityId: z.number().int().positive(),
    university: z.object({
      id: z.number().int().positive(),
      name: z.string().min(1),
      acronym: optionalTextSchema,
    }),
  }),
});

const studyProgramSearchResponseSchema = z.object({
  message: z.string(),
  data: z.array(studyProgramSearchResultSchema),
});

export type UniversityDetail = z.infer<typeof universityDetailSchema>;
export type UniversityListItem = z.infer<typeof universityListItemSchema>;
export type UniversityDetailFaculty = UniversityDetail["faculties"][number];
export type UniversityDetailStudyProgram =
  UniversityDetailFaculty["studyPrograms"][number];
export type UniversityDetailSubject =
  UniversityDetailStudyProgram["subjects"][number];
export type StudyProgramSearchResult = z.infer<
  typeof studyProgramSearchResultSchema
>;
export {
  studyProgramSearchResponseSchema,
  universityDetailResponseSchema,
  universityListResponseSchema,
};
