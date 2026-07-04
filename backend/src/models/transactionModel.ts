import { prisma } from "../db/prisma.js";
import {
  buildPendingChangeData,
  isCompleteFacultyPendingChangeData,
  isCompleteStudyProgramPendingChangeData,
  isCompleteSubjectPendingChangeData,
  isCompleteUniversityPendingChangeData,
} from "../utils/pendingChangeData.js";

const VALID_CHANGE_TYPES = ["CREATE", "UPDATE", "DELETE"] as const;

class TransactionModel {
  async approvePendingChange({ id }: { id: string }): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const pendingChange = await tx.pendingChange.findUnique({
        where: { id },
      });

      if (!pendingChange) {
        return false;
      }

      const { entityType, typeOfChange, targetId, parentId } = pendingChange;

      if (!VALID_CHANGE_TYPES.includes(typeOfChange)) {
        return false;
      }

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

        const data = buildPendingChangeData(entityType, pendingChange.data);
        if (!data) return false;

        if (typeOfChange === "CREATE") {
          if (!isCompleteUniversityPendingChangeData(data)) return false;

          await tx.university.create({ data });
          return deletePendingChange();
        }

        if (targetId === null) return false;

        await tx.university.update({
          where: { id: targetId },
          data,
        });

        return deletePendingChange();
      }

      if (entityType === "FACULTY") {
        if (typeOfChange === "DELETE") {
          if (targetId === null) return false;

          await tx.faculty.delete({ where: { id: targetId } });
          return deletePendingChange();
        }

        const data = buildPendingChangeData(entityType, pendingChange.data);
        if (!data) return false;

        if (typeOfChange === "CREATE") {
          if (parentId === null || !isCompleteFacultyPendingChangeData(data)) {
            return false;
          }

          await tx.faculty.create({
            data: { ...data, universityId: parentId },
          });

          return deletePendingChange();
        }

        if (targetId === null) return false;

        await tx.faculty.update({
          where: { id: targetId },
          data,
        });

        return deletePendingChange();
      }

      if (entityType === "STUDY_PROGRAM") {
        if (typeOfChange === "DELETE") {
          if (targetId === null) return false;

          await tx.studyProgram.delete({ where: { id: targetId } });
          return deletePendingChange();
        }

        const data = buildPendingChangeData(entityType, pendingChange.data);
        if (!data) return false;

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

          return deletePendingChange();
        }

        if (targetId === null) return false;

        await tx.studyProgram.update({
          where: { id: targetId },
          data,
        });

        return deletePendingChange();
      }

      if (entityType === "SUBJECT") {
        if (typeOfChange === "DELETE") {
          if (targetId === null) return false;

          await tx.subject.delete({ where: { id: targetId } });
          return deletePendingChange();
        }

        const data = buildPendingChangeData(entityType, pendingChange.data);
        if (!data) return false;

        if (typeOfChange === "CREATE") {
          if (parentId === null || !isCompleteSubjectPendingChangeData(data)) {
            return false;
          }

          await tx.subject.create({
            data: { ...data, studyProgramId: parentId },
          });

          return deletePendingChange();
        }

        if (targetId === null) return false;

        await tx.subject.update({
          where: { id: targetId },
          data,
        });

        return deletePendingChange();
      }

      return false;
    });
  }
}

const transactionModel = new TransactionModel();

export { transactionModel };
