import type { UserData } from "../../types/auth";

export type EntityType = "UNIVERSITY" | "FACULTY" | "STUDY_PROGRAM" | "SUBJECT";
export type TypeOfChange = "CREATE" | "UPDATE" | "DELETE";
export type Cycle = "FIRST" | "SECOND" | "THIRD";
export type SubjectType = "MANDATORY" | "ELECTIVE";
export type Entity = "FBIH" | "RS" | "BD";

export interface ContributionFormData {
  name?: string;
  city?: string;
  entity?: Entity;
  ownership?: "JAVNA" | "PRIVATNA";
  website?: string;
  cycle?: Cycle;
  durationYears?: number;
  ects?: number;
  language?: string;
  semester?: number;
  type?: SubjectType;
}

export interface ContributionFormState {
  entityType: EntityType;
  typeOfChange: TypeOfChange;
  parentId: string;
  targetId: string;
  data: ContributionFormData;
}

export interface PendingChange {
  id: string;
  entityType: EntityType;
  typeOfChange: TypeOfChange;
  targetId: number | null;
  parentId: number | null;
  data: UserData;
  userId: string;
  user: UserData;
  createdAt: Date;
}
