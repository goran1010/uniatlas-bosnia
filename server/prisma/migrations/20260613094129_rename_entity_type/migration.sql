/*
  Warnings:

  - Changed the type of `entityType` on the `pending_changes_university` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "entityType" AS ENUM ('UNIVERSITY', 'FACULTY', 'STUDY_PROGRAM', 'SUBJECT');

-- AlterTable
ALTER TABLE "pending_changes_university" DROP COLUMN "entityType",
ADD COLUMN     "entityType" "entityType" NOT NULL;

-- DropEnum
DROP TYPE "universityEntityType";
