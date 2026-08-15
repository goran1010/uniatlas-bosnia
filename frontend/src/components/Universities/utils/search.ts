import { BACKEND_URL } from "../../../utils/envConfig";
import { readErrorMessage } from "../../../schemas/api";
import {
  studyProgramSearchResponseSchema,
  universityListResponseSchema,
} from "../../../schemas/university";

import type {
  StudyProgramSearchResult,
  UniversityListItem,
} from "../../../schemas/university";

async function searchUniversities(term: string): Promise<UniversityListItem[]> {
  const res = await fetch(
    `${BACKEND_URL}/api/v1/universities/search?searchTerm=${encodeURIComponent(term)}`,
    { method: "GET", mode: "cors" },
  );

  if (res.ok) {
    const result = universityListResponseSchema.parse(await res.json());
    return result.data;
  }
  if (res.status === 404) {
    return [];
  }
  const serverMessage = readErrorMessage(await res.json());
  if (serverMessage) {
    console.warn("University search failed:", serverMessage);
  }
  throw new Error("University search failed");
}

async function searchStudyPrograms(
  term: string,
): Promise<StudyProgramSearchResult[]> {
  const res = await fetch(
    `${BACKEND_URL}/api/v1/study-programs/search?searchTerm=${encodeURIComponent(term)}`,
    { method: "GET", mode: "cors" },
  );

  if (res.ok) {
    const result = studyProgramSearchResponseSchema.parse(await res.json());
    return result.data;
  }
  if (res.status === 404) {
    return [];
  }
  const serverMessage = readErrorMessage(await res.json());
  if (serverMessage) {
    console.warn("Study program search failed:", serverMessage);
  }
  throw new Error("Study program search failed");
}

export { searchStudyPrograms, searchUniversities };
