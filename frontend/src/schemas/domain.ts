import { z } from "zod";

const entityTypeSchema = z.enum([
  "UNIVERSITY",
  "FACULTY",
  "STUDY_PROGRAM",
  "SUBJECT",
]);
const entitySchema = z.enum(["FBIH", "RS", "BD"]);
const ownershipSchema = z.enum(["JAVNA", "PRIVATNA"]);
const studyCycleSchema = z.enum(["FIRST", "SECOND", "THIRD"]);
const subjectTypeSchema = z.enum(["MANDATORY", "ELECTIVE"]);
const userRoleSchema = z.enum(["ADMIN", "USER"]);

const integerSchema = z.number().int();
const positiveIntegerSchema = integerSchema.positive();
const durationYearsSchema = integerSchema.min(1).max(10);
const ectsSchema = positiveIntegerSchema;
const semesterSchema = integerSchema.min(1).max(12);

export {
  durationYearsSchema,
  ectsSchema,
  entitySchema,
  entityTypeSchema,
  integerSchema,
  ownershipSchema,
  positiveIntegerSchema,
  semesterSchema,
  studyCycleSchema,
  subjectTypeSchema,
  userRoleSchema,
};
