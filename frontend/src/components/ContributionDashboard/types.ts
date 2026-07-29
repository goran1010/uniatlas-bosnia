import type { PendingChange } from "../../schemas/pendingChange";

export type EntityType = "UNIVERSITY" | "FACULTY" | "STUDY_PROGRAM" | "SUBJECT";
export type TypeOfChange = "CREATE" | "UPDATE" | "DELETE";
export type Cycle = "FIRST" | "SECOND" | "THIRD";
export type SubjectType = "MANDATORY" | "ELECTIVE";
export type Entity = "FBIH" | "RS" | "BD";

export interface ContributionFormDraft {
  name?: string;
  city?: string;
  entity?: Entity;
  ownership?: "JAVNA" | "PRIVATNA";
  cycle?: Cycle;
  durationYears?: number;
  ects?: number;
  semester?: number;
  type?: SubjectType;
}

export interface ContributionFormState {
  entityType: EntityType;
  typeOfChange: TypeOfChange;
  parentId: string;
  targetId: string;
  data: ContributionFormDraft;
}

export type { PendingChange };
