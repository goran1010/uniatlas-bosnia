import { z } from "zod";

import {
  entitySchema,
  integerSchema,
  ownershipSchema,
  positiveIntegerSchema,
  studyCycleSchema,
  subjectTypeSchema,
} from "./domain";

const optionalTextSchema = z
  .string()
  .nullish()
  .transform((value) => value ?? undefined);

const universitySchema = z.object({
  id: positiveIntegerSchema,
  name: z.string().min(1),
  acronym: optionalTextSchema,
  city: z.string().min(1),
  entity: entitySchema,
  ownership: ownershipSchema,
  foundedYear: optionalTextSchema,
  website: optionalTextSchema,
  accreditationFrom: optionalTextSchema,
  accreditationTo: optionalTextSchema,
  authority: optionalTextSchema,
  sourceUrl: optionalTextSchema,
  lastChecked: optionalTextSchema,
});

const subjectSchema = z.object({
  id: positiveIntegerSchema,
  name: z.string().min(1),
  studyProgramId: positiveIntegerSchema,
  semester: integerSchema.nullish().transform((value) => value ?? undefined),
  ects: integerSchema.nullish().transform((value) => value ?? undefined),
  type: subjectTypeSchema.nullish().transform((value) => value ?? undefined),
  sourceUrl: optionalTextSchema,
});

const studyProgramSchema = z.object({
  id: positiveIntegerSchema,
  name: z.string().min(1),
  facultyId: positiveIntegerSchema,
  cycle: studyCycleSchema,
  durationYears: integerSchema
    .nullish()
    .transform((value) => value ?? undefined),
  ects: integerSchema.nullish().transform((value) => value ?? undefined),
  language: optionalTextSchema,
  sourceUrl: optionalTextSchema,
  subjects: z.array(subjectSchema),
});

const facultySchema = z.object({
  id: positiveIntegerSchema,
  name: z.string().min(1),
  universityId: positiveIntegerSchema,
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
  id: positiveIntegerSchema,
  name: z.string().min(1),
  facultyId: positiveIntegerSchema,
  cycle: studyCycleSchema,
  ects: integerSchema.nullish().transform((value) => value ?? undefined),
  faculty: z.object({
    id: positiveIntegerSchema,
    name: z.string().min(1),
    universityId: positiveIntegerSchema,
    university: z.object({
      id: positiveIntegerSchema,
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
