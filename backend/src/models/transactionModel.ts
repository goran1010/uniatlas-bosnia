import { prisma } from "../db/prisma.js";
import type { Prisma } from "#generated/prisma/client.js";

class TransactionModel {
  async approveUniversityPendingChange({
    id,
    entityType,
    typeOfChange,
  }: {
    id: string;
    entityType: "UNIVERSITY" | "FACULTY" | "STUDY_PROGRAM" | "SUBJECT";
    typeOfChange: "CREATE" | "UPDATE" | "DELETE";
  }): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const pendingChange = await tx.pendingChange.findUnique({
        where: { id },
      });

      if (
        !pendingChange ||
        typeof pendingChange.data !== "object" ||
        pendingChange.data === null
      ) {
        return false;
      }

      const parentId = pendingChange.parentId;
      const targetId = pendingChange.targetId;

      if (entityType === "UNIVERSITY") {
        const data = pendingChange.data as Prisma.UniversityCreateInput;
        if (typeOfChange === "CREATE") {
          await tx.university.create({ data });
          await tx.pendingChange.delete({ where: { id } });
          return true;
        }
        if (targetId === null) {
          return false;
        }
        if (typeOfChange === "UPDATE") {
          await tx.university.update({ where: { id: targetId }, data });
        } else if (typeOfChange === "DELETE") {
          await tx.university.delete({ where: { id: targetId } });
        }
        await tx.pendingChange.delete({ where: { id } });
        return true;
      }
      if (parentId === null) {
        return false;
      }
      if (entityType === "FACULTY") {
        const data = pendingChange.data as Omit<
          Prisma.FacultyUncheckedCreateInput,
          "universityId"
        >;
        if (typeOfChange === "CREATE") {
          await tx.faculty.create({
            data: { ...data, universityId: parentId },
          });
          await tx.pendingChange.delete({ where: { id } });
          return true;
        }
        if (targetId === null) {
          return false;
        }
        if (typeOfChange === "UPDATE") {
          await tx.faculty.update({ where: { id: targetId }, data });
        } else if (typeOfChange === "DELETE") {
          await tx.faculty.delete({ where: { id: targetId } });
        }
        await tx.pendingChange.delete({ where: { id } });
        return true;
      } else if (entityType === "STUDY_PROGRAM") {
        const data = pendingChange.data as Omit<
          Prisma.StudyProgramUncheckedCreateInput,
          "facultyId"
        >;
        if (typeOfChange === "CREATE") {
          await tx.studyProgram.create({
            data: { ...data, facultyId: parentId },
          });
          await tx.pendingChange.delete({ where: { id } });
          return true;
        }
        if (targetId === null) {
          return false;
        }
        if (typeOfChange === "UPDATE") {
          await tx.studyProgram.update({ where: { id: targetId }, data });
        } else if (typeOfChange === "DELETE") {
          await tx.studyProgram.delete({ where: { id: targetId } });
        }
      } else if (entityType === "SUBJECT") {
        const data = pendingChange.data as Omit<
          Prisma.SubjectUncheckedCreateInput,
          "studyProgramId"
        >;
        if (typeOfChange === "CREATE") {
          await tx.subject.create({
            data: { ...data, studyProgramId: parentId },
          });
          await tx.pendingChange.delete({ where: { id } });
          return true;
        }
        if (targetId === null) {
          return false;
        }
        if (typeOfChange === "UPDATE") {
          await tx.subject.update({ where: { id: targetId }, data });
        } else if (typeOfChange === "DELETE") {
          await tx.subject.delete({ where: { id: targetId } });
        }
      }

      await tx.pendingChange.delete({ where: { id } });
      return true;
    });
  }
}

const transactionModel = new TransactionModel();

export { transactionModel };
