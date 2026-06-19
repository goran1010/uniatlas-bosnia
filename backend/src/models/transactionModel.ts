import { prisma } from "../db/prisma.js";

interface ApprovePendingChangeParams {
  id: string;
  entityType: "UNIVERSITY" | "FACULTY" | "STUDY_PROGRAM" | "SUBJECT";
  typeOfChange: "CREATE" | "UPDATE" | "DELETE";
}

class TransactionModel {
  async approveUniversityPendingChange({
    id,
    entityType,
    typeOfChange,
  }: ApprovePendingChangeParams) {
    return prisma.$transaction(async (tx) => {
      const pendingChange = await tx.pendingChangesUniversity.findUnique({
        where: { id },
      });

      if (!pendingChange) {
        return false;
      }

      const parentId = pendingChange.parentId;
      const targetId = pendingChange.targetId;
      if (!targetId) {
        return false;
      }

      const data = pendingChange.data;

      if (entityType === "UNIVERSITY") {
        if (typeOfChange === "CREATE") {
          await tx.university.create({ data });
        } else if (typeOfChange === "UPDATE") {
          await tx.university.update({ where: { id: targetId }, data });
        } else if (typeOfChange === "DELETE") {
          await tx.university.delete({ where: { id: targetId } });
        }
      } else if (entityType === "FACULTY") {
        if (typeOfChange === "CREATE") {
          await tx.faculty.create({
            data: { ...data, universityId: parentId },
          });
        } else if (typeOfChange === "UPDATE") {
          await tx.faculty.update({ where: { id: targetId }, data });
        } else if (typeOfChange === "DELETE") {
          await tx.faculty.delete({ where: { id: targetId } });
        }
      } else if (entityType === "STUDY_PROGRAM") {
        if (typeOfChange === "CREATE") {
          await tx.studyProgram.create({
            data: { ...data, facultyId: parentId },
          });
        } else if (typeOfChange === "UPDATE") {
          await tx.studyProgram.update({ where: { id: targetId }, data });
        } else if (typeOfChange === "DELETE") {
          await tx.studyProgram.delete({ where: { id: targetId } });
        }
      } else if (entityType === "SUBJECT") {
        if (typeOfChange === "CREATE") {
          await tx.subject.create({
            data: { ...data, studyProgramId: parentId },
          });
        } else if (typeOfChange === "UPDATE") {
          await tx.subject.update({ where: { id: targetId }, data });
        } else if (typeOfChange === "DELETE") {
          await tx.subject.delete({ where: { id: targetId } });
        }
      }

      await tx.pendingChangesUniversity.delete({ where: { id } });

      return true;
    });
  }
}

const transactionModel = new TransactionModel();

export { transactionModel };
