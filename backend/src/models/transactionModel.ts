import { prisma } from "../db/prisma.js";
import {
  facultyCreateDataSchema,
  facultyEditDataSchema,
  studyProgramCreateDataSchema,
  studyProgramEditDataSchema,
  subjectCreateDataSchema,
  subjectEditDataSchema,
  universityCreateDataSchema,
  universityEditDataSchema,
} from "../validation/contributionValidation.js";

import type { Prisma } from "../generated/prisma/client.js";
import type {
  FacultyCreateData,
  FacultyEditData,
  StudyProgramCreateData,
  StudyProgramEditData,
  SubjectCreateData,
  SubjectEditData,
  UniversityCreateData,
  UniversityEditData,
} from "../validation/contributionValidation.js";

function toUniversityCreateInput(
  data: UniversityCreateData,
): Prisma.UniversityCreateInput {
  return data;
}

function toUniversityUpdateInput(
  data: UniversityEditData,
): Prisma.UniversityUpdateInput {
  return {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.city !== undefined && { city: data.city }),
    ...(data.entity !== undefined && { entity: data.entity }),
    ...(data.ownership !== undefined && { ownership: data.ownership }),
  };
}

function toFacultyCreateInput(
  data: FacultyCreateData,
  universityId: number,
): Prisma.FacultyUncheckedCreateInput {
  return {
    name: data.name,
    universityId,
    ...(data.city !== undefined && { city: data.city }),
  };
}

function toFacultyUpdateInput(
  data: FacultyEditData,
): Prisma.FacultyUpdateInput {
  return {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.city !== undefined && { city: data.city }),
  };
}

function toStudyProgramCreateInput(
  data: StudyProgramCreateData,
  facultyId: number,
): Prisma.StudyProgramUncheckedCreateInput {
  return {
    name: data.name,
    cycle: data.cycle,
    facultyId,
    ...(data.durationYears !== undefined && {
      durationYears: data.durationYears,
    }),
    ...(data.ects !== undefined && { ects: data.ects }),
  };
}

function toStudyProgramUpdateInput(
  data: StudyProgramEditData,
): Prisma.StudyProgramUpdateInput {
  return {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.cycle !== undefined && { cycle: data.cycle }),
    ...(data.durationYears !== undefined && {
      durationYears: data.durationYears,
    }),
    ...(data.ects !== undefined && { ects: data.ects }),
  };
}

function toSubjectCreateInput(
  data: SubjectCreateData,
  studyProgramId: number,
): Prisma.SubjectUncheckedCreateInput {
  return {
    name: data.name,
    studyProgramId,
    ...(data.semester !== undefined && { semester: data.semester }),
    ...(data.ects !== undefined && { ects: data.ects }),
    ...(data.type !== undefined && { type: data.type }),
  };
}

function toSubjectUpdateInput(
  data: SubjectEditData,
): Prisma.SubjectUpdateInput {
  return {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.semester !== undefined && { semester: data.semester }),
    ...(data.ects !== undefined && { ects: data.ects }),
    ...(data.type !== undefined && { type: data.type }),
  };
}

async function approvePendingChange({ id }: { id: string }): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const pendingChange = await tx.pendingChange.findUnique({
      where: { id },
    });

    if (!pendingChange) {
      return false;
    }

    const { entityType, typeOfChange, targetId, parentId } = pendingChange;

    const deletePendingChange = async () => {
      await tx.pendingChange.delete({ where: { id } });
      return true;
    };

    if (entityType === "UNIVERSITY") {
      if (typeOfChange === "DELETE") {
        if (targetId === null) return false;

        await tx.university.delete({ where: { id: targetId } });
        return deletePendingChange();
      }

      if (typeOfChange === "CREATE") {
        const data = universityCreateDataSchema.safeParse(pendingChange.data);
        if (!data.success) return false;

        await tx.university.create({
          data: toUniversityCreateInput(data.data),
        });
        return deletePendingChange();
      }

      if (targetId === null) return false;

      const data = universityEditDataSchema.safeParse(pendingChange.data);
      if (!data.success) return false;

      await tx.university.update({
        where: { id: targetId },
        data: toUniversityUpdateInput(data.data),
      });

      return deletePendingChange();
    }

    if (entityType === "FACULTY") {
      if (typeOfChange === "DELETE") {
        if (targetId === null) return false;

        await tx.faculty.delete({ where: { id: targetId } });
        return deletePendingChange();
      }

      if (typeOfChange === "CREATE") {
        if (parentId === null) return false;

        const data = facultyCreateDataSchema.safeParse(pendingChange.data);
        if (!data.success) return false;

        await tx.faculty.create({
          data: toFacultyCreateInput(data.data, parentId),
        });

        return deletePendingChange();
      }

      if (targetId === null) return false;

      const data = facultyEditDataSchema.safeParse(pendingChange.data);
      if (!data.success) return false;

      await tx.faculty.update({
        where: { id: targetId },
        data: toFacultyUpdateInput(data.data),
      });

      return deletePendingChange();
    }

    if (entityType === "STUDY_PROGRAM") {
      if (typeOfChange === "DELETE") {
        if (targetId === null) return false;

        await tx.studyProgram.delete({ where: { id: targetId } });
        return deletePendingChange();
      }

      if (typeOfChange === "CREATE") {
        if (parentId === null) return false;

        const data = studyProgramCreateDataSchema.safeParse(pendingChange.data);
        if (!data.success) return false;

        await tx.studyProgram.create({
          data: toStudyProgramCreateInput(data.data, parentId),
        });

        return deletePendingChange();
      }

      if (targetId === null) return false;

      const data = studyProgramEditDataSchema.safeParse(pendingChange.data);
      if (!data.success) return false;

      await tx.studyProgram.update({
        where: { id: targetId },
        data: toStudyProgramUpdateInput(data.data),
      });

      return deletePendingChange();
    }

    if (typeOfChange === "DELETE") {
      if (targetId === null) return false;

      await tx.subject.delete({ where: { id: targetId } });
      return deletePendingChange();
    }

    if (typeOfChange === "CREATE") {
      if (parentId === null) return false;

      const data = subjectCreateDataSchema.safeParse(pendingChange.data);
      if (!data.success) return false;

      await tx.subject.create({
        data: toSubjectCreateInput(data.data, parentId),
      });

      return deletePendingChange();
    }

    if (targetId === null) return false;

    const data = subjectEditDataSchema.safeParse(pendingChange.data);
    if (!data.success) return false;

    await tx.subject.update({
      where: { id: targetId },
      data: toSubjectUpdateInput(data.data),
    });

    return deletePendingChange();
  });
}

export { approvePendingChange };
