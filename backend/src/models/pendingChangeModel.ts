import { prisma } from "../db/prisma.js";

import type { entityType } from "../generated/prisma/enums.js";

interface PendingChangeWithTarget {
  entityType: entityType;
  targetId: number | null;
}

/**
 * For UPDATE/DELETE pending changes, batch-fetch the current entity data
 * from the corresponding table so the reviewer (admin or contributor)
 * can see what is being changed or removed.
 *
 * Returns the same array with `currentEntity` attached to each item
 * (null when no matching entity exists or the change is CREATE).
 */
async function enrichWithCurrentEntity<T extends PendingChangeWithTarget>(
  pendingChanges: T[],
) {
  const targetIds: Record<entityType, number[]> = {
    UNIVERSITY: [],
    FACULTY: [],
    STUDY_PROGRAM: [],
    SUBJECT: [],
  };

  for (const pc of pendingChanges) {
    if (pc.targetId != null) {
      targetIds[pc.entityType].push(pc.targetId);
    }
  }

  const [universities, faculties, studyPrograms, subjects] = await Promise.all([
    targetIds.UNIVERSITY.length > 0
      ? prisma.university.findMany({
          where: { id: { in: targetIds.UNIVERSITY } },
          select: {
            id: true,
            name: true,
            city: true,
            entity: true,
            ownership: true,
            foundedYear: true,
            website: true,
          },
        })
      : [],
    targetIds.FACULTY.length > 0
      ? prisma.faculty.findMany({
          where: { id: { in: targetIds.FACULTY } },
          select: { id: true, name: true, city: true, website: true },
        })
      : [],
    targetIds.STUDY_PROGRAM.length > 0
      ? prisma.studyProgram.findMany({
          where: { id: { in: targetIds.STUDY_PROGRAM } },
          select: {
            id: true,
            name: true,
            cycle: true,
            durationYears: true,
            ects: true,
            language: true,
          },
        })
      : [],
    targetIds.SUBJECT.length > 0
      ? prisma.subject.findMany({
          where: { id: { in: targetIds.SUBJECT } },
          select: {
            id: true,
            name: true,
            semester: true,
            ects: true,
            type: true,
          },
        })
      : [],
  ]);

  const entityMaps: Record<entityType, Map<number, object>> = {
    UNIVERSITY: new Map(universities.map((e) => [e.id, e])),
    FACULTY: new Map(faculties.map((e) => [e.id, e])),
    STUDY_PROGRAM: new Map(studyPrograms.map((e) => [e.id, e])),
    SUBJECT: new Map(subjects.map((e) => [e.id, e])),
  };

  return pendingChanges.map((pc) => ({
    ...pc,
    currentEntity:
      pc.targetId != null
        ? (entityMaps[pc.entityType].get(pc.targetId) ?? null)
        : null,
  }));
}

export { enrichWithCurrentEntity };
