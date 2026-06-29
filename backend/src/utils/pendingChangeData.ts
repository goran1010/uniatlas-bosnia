import type { Prisma } from "#generated/prisma/client.js";

type ContributionEntityType =
  | "UNIVERSITY"
  | "FACULTY"
  | "STUDY_PROGRAM"
  | "SUBJECT";

type UniversityEntity = "FBIH" | "RS" | "BD";
type UniversityOwnership = "JAVNA" | "PRIVATNA";
type StudyCycle = "FIRST" | "SECOND" | "THIRD";
type SubjectType = "MANDATORY" | "ELECTIVE";

interface UniversityPendingChangeData {
  name?: string;
  city?: string;
  entity?: UniversityEntity;
  ownership?: UniversityOwnership;
}

interface FacultyPendingChangeData {
  name?: string;
  city?: string;
}

interface StudyProgramPendingChangeData {
  name?: string;
  cycle?: StudyCycle;
  durationYears?: number;
  ects?: number;
}

interface SubjectPendingChangeData {
  name?: string;
  semester?: number;
  ects?: number;
  type?: SubjectType;
}

type PendingChangeData =
  | UniversityPendingChangeData
  | FacultyPendingChangeData
  | StudyProgramPendingChangeData
  | SubjectPendingChangeData;

type SanitizedPendingChangeData = PendingChangeData & Prisma.InputJsonObject;

type JsonRecord = Record<string, Prisma.InputJsonValue | null | undefined>;

const ENTITY_DATA_KEYS: Record<ContributionEntityType, readonly string[]> = {
  UNIVERSITY: ["name", "city", "entity", "ownership"],
  FACULTY: ["name", "city"],
  STUDY_PROGRAM: ["name", "cycle", "durationYears", "ects"],
  SUBJECT: ["name", "semester", "ects", "type"],
};

const UNIVERSITY_ENTITIES = ["FBIH", "RS", "BD"] as const;
const UNIVERSITY_OWNERSHIP = ["JAVNA", "PRIVATNA"] as const;
const STUDY_CYCLES = ["FIRST", "SECOND", "THIRD"] as const;
const SUBJECT_TYPES = ["MANDATORY", "ELECTIVE"] as const;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasOnlyAllowedKeys(
  entityType: ContributionEntityType,
  value: JsonRecord,
): boolean {
  const allowedKeys = ENTITY_DATA_KEYS[entityType];
  return Object.keys(value).every((key) => allowedKeys.includes(key));
}

function isOneOf<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
): value is T {
  return typeof value === "string" && allowedValues.includes(value as T);
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readInteger(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && /^-?\d+$/.test(value)) {
    return Number(value);
  }

  return undefined;
}

function withOptionalString(target: JsonRecord, key: string, value: unknown) {
  const parsedValue = readString(value);
  if (parsedValue !== undefined) {
    target[key] = parsedValue;
  }
}

function withOptionalInteger(target: JsonRecord, key: string, value: unknown) {
  const parsedValue = readInteger(value);
  if (parsedValue !== undefined) {
    target[key] = parsedValue;
  }
}

function withOptionalEnum<T extends string>(
  target: JsonRecord,
  key: string,
  value: unknown,
  allowedValues: readonly T[],
) {
  if (isOneOf(value, allowedValues)) {
    target[key] = value;
  }
}

export function hasValidPendingChangeDataShape(
  entityType: ContributionEntityType,
  value: unknown,
): value is JsonRecord {
  return isRecord(value) && hasOnlyAllowedKeys(entityType, value);
}

export function buildPendingChangeData(
  entityType: ContributionEntityType,
  value: unknown,
): SanitizedPendingChangeData | null {
  if (!isRecord(value)) {
    return null;
  }

  const safeValue: JsonRecord = value;

  switch (entityType) {
    case "UNIVERSITY": {
      const data: JsonRecord = {};
      withOptionalString(data, "name", safeValue["name"]);
      withOptionalString(data, "city", safeValue["city"]);
      withOptionalEnum(
        data,
        "entity",
        safeValue["entity"],
        UNIVERSITY_ENTITIES,
      );
      withOptionalEnum(
        data,
        "ownership",
        safeValue["ownership"],
        UNIVERSITY_OWNERSHIP,
      );
      return data as SanitizedPendingChangeData;
    }

    case "FACULTY": {
      const data: JsonRecord = {};
      withOptionalString(data, "name", safeValue["name"]);
      withOptionalString(data, "city", safeValue["city"]);
      return data as SanitizedPendingChangeData;
    }

    case "STUDY_PROGRAM": {
      const data: JsonRecord = {};
      withOptionalString(data, "name", safeValue["name"]);
      withOptionalEnum(data, "cycle", safeValue["cycle"], STUDY_CYCLES);
      withOptionalInteger(data, "durationYears", safeValue["durationYears"]);
      withOptionalInteger(data, "ects", safeValue["ects"]);
      return data as SanitizedPendingChangeData;
    }

    case "SUBJECT": {
      const data: JsonRecord = {};
      withOptionalString(data, "name", safeValue["name"]);
      withOptionalInteger(data, "semester", safeValue["semester"]);
      withOptionalInteger(data, "ects", safeValue["ects"]);
      withOptionalEnum(data, "type", safeValue["type"], SUBJECT_TYPES);
      return data as SanitizedPendingChangeData;
    }
  }
}

export function isCompleteUniversityPendingChangeData(
  data: UniversityPendingChangeData,
): data is Required<UniversityPendingChangeData> {
  return (
    typeof data.name === "string" &&
    typeof data.city === "string" &&
    typeof data.entity === "string" &&
    typeof data.ownership === "string"
  );
}

export function isCompleteFacultyPendingChangeData(
  data: FacultyPendingChangeData,
): data is Required<Pick<FacultyPendingChangeData, "name">> &
  FacultyPendingChangeData {
  return typeof data.name === "string";
}

export function isCompleteStudyProgramPendingChangeData(
  data: StudyProgramPendingChangeData,
): data is Required<Pick<StudyProgramPendingChangeData, "name" | "cycle">> &
  StudyProgramPendingChangeData {
  return typeof data.name === "string" && typeof data.cycle === "string";
}

export function isCompleteSubjectPendingChangeData(
  data: SubjectPendingChangeData,
): data is Required<Pick<SubjectPendingChangeData, "name">> &
  SubjectPendingChangeData {
  return typeof data.name === "string";
}

export type {
  ContributionEntityType,
  FacultyPendingChangeData,
  PendingChangeData,
  SanitizedPendingChangeData,
  StudyProgramPendingChangeData,
  SubjectPendingChangeData,
  UniversityPendingChangeData,
};
