import { prisma } from "../db/prisma.js";
import {
  buildPendingChangeData,
  isCompleteFacultyPendingChangeData,
  isCompleteStudyProgramPendingChangeData,
  isCompleteSubjectPendingChangeData,
  isCompleteUniversityPendingChangeData,
} from "../utils/pendingChangeData.js";

class TransactionModel {
  async approveUniversityPendingChange({
    id,
  }: {
    id: string;
  }): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const pendingChange = await tx.pendingChange.findUnique({
        where: { id },
      });

      if (!pendingChange) {
        return false;
      }

      const parentId = pendingChange.parentId;
      const targetId = pendingChange.targetId;
      const { entityType, typeOfChange } = pendingChange;

      if (entityType === "UNIVERSITY") {
        if (typeOfChange === "DELETE") {
          if (targetId === null) {
            return false;
          }

          await tx.university.delete({ where: { id: targetId } });
          await tx.pendingChange.delete({ where: { id } });
          return true;
        }

        const data = buildPendingChangeData(entityType, pendingChange.data);
        if (!data) {
          return false;
        }

        if (typeOfChange === "CREATE") {
          if (!isCompleteUniversityPendingChangeData(data)) {
            return false;
          }

          await tx.university.create({ data });
          await tx.pendingChange.delete({ where: { id } });
          return true;
        }

        if (targetId === null) {
          return false;
        }

        if (typeOfChange === "UPDATE") {
          await tx.university.update({ where: { id: targetId }, data });
        }

        await tx.pendingChange.delete({ where: { id } });
        return true;
      }

      if (entityType === "FACULTY") {
        if (typeOfChange === "DELETE") {
          if (targetId === null) {
            return false;
          }

          await tx.faculty.delete({ where: { id: targetId } });
          await tx.pendingChange.delete({ where: { id } });
          return true;
        }

        const data = buildPendingChangeData(entityType, pendingChange.data);
        if (!data) {
          return false;
        }

        if (typeOfChange === "CREATE") {
          if (parentId === null || !isCompleteFacultyPendingChangeData(data)) {
            return false;
          }

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
        }

        await tx.pendingChange.delete({ where: { id } });
        return true;
      } else if (entityType === "STUDY_PROGRAM") {
        if (typeOfChange === "DELETE") {
          if (targetId === null) {
            return false;
          }

          await tx.studyProgram.delete({ where: { id: targetId } });
          await tx.pendingChange.delete({ where: { id } });
          return true;
        }

        const data = buildPendingChangeData(entityType, pendingChange.data);
        if (!data) {
          return false;
        }

        if (typeOfChange === "CREATE") {
          if (
            parentId === null ||
            !isCompleteStudyProgramPendingChangeData(data)
          ) {
            return false;
          }

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
        }
      } else if (entityType === "SUBJECT") {
        if (typeOfChange === "DELETE") {
          if (targetId === null) {
            return false;
          }

          await tx.subject.delete({ where: { id: targetId } });
          await tx.pendingChange.delete({ where: { id } });
          return true;
        }

        const data = buildPendingChangeData(entityType, pendingChange.data);
        if (!data) {
          return false;
        }

        if (typeOfChange === "CREATE") {
          if (parentId === null || !isCompleteSubjectPendingChangeData(data)) {
            return false;
          }

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
        }
      }

      await tx.pendingChange.delete({ where: { id } });
      return true;
    });
  }
}

const transactionModel = new TransactionModel();

export { transactionModel };
