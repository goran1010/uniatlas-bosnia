/*
  Warnings:

  - You are about to drop the `pending_changes_postal_code` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `postal_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ownership" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "entity" AS ENUM ('FBIH', 'RS', 'BD');

-- CreateEnum
CREATE TYPE "studyCycle" AS ENUM ('FIRST', 'SECOND', 'THIRD');

-- CreateEnum
CREATE TYPE "subjectType" AS ENUM ('MANDATORY', 'ELECTIVE');

-- CreateEnum
CREATE TYPE "universityEntityType" AS ENUM ('UNIVERSITY', 'FACULTY', 'STUDY_PROGRAM', 'SUBJECT');

-- DropForeignKey
ALTER TABLE "pending_changes_postal_code" DROP CONSTRAINT "pending_changes_postal_code_userId_fkey";

-- DropTable
DROP TABLE "pending_changes_postal_code";

-- DropTable
DROP TABLE "postal_codes";

-- DropEnum
DROP TYPE "postOperator";

-- CreateTable
CREATE TABLE "universities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT,
    "city" TEXT NOT NULL,
    "entity" "entity" NOT NULL,
    "ownership" "ownership" NOT NULL,
    "foundedYear" TEXT,
    "website" TEXT,
    "accreditationFrom" TIMESTAMP(3),
    "accreditationTo" TIMESTAMP(3),
    "authority" TEXT,
    "sourceUrl" TEXT,
    "lastChecked" TIMESTAMP(3),

    CONSTRAINT "universities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculties" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "universityId" INTEGER NOT NULL,
    "city" TEXT,
    "website" TEXT,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_programs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "facultyId" INTEGER NOT NULL,
    "cycle" "studyCycle" NOT NULL,
    "durationYears" INTEGER,
    "ects" INTEGER,
    "language" TEXT,
    "sourceUrl" TEXT,

    CONSTRAINT "study_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "studyProgramId" INTEGER NOT NULL,
    "semester" INTEGER,
    "ects" INTEGER,
    "type" "subjectType",
    "sourceUrl" TEXT,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_changes_university" (
    "id" TEXT NOT NULL,
    "entityType" "universityEntityType" NOT NULL,
    "typeOfChange" "typeOfChange" NOT NULL,
    "targetId" INTEGER,
    "parentId" INTEGER,
    "data" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_changes_university_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_key" ON "universities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_name_universityId_key" ON "faculties"("name", "universityId");

-- CreateIndex
CREATE UNIQUE INDEX "study_programs_name_facultyId_cycle_key" ON "study_programs"("name", "facultyId", "cycle");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_name_studyProgramId_key" ON "subjects"("name", "studyProgramId");

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_programs" ADD CONSTRAINT "study_programs_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_studyProgramId_fkey" FOREIGN KEY ("studyProgramId") REFERENCES "study_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_changes_university" ADD CONSTRAINT "pending_changes_university_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
