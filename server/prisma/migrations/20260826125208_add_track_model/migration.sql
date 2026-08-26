-- AlterEnum
ALTER TYPE "entityType" ADD VALUE 'TRACK';

-- CreateTable
CREATE TABLE "tracks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "studyProgramId" INTEGER NOT NULL,
    "ects" INTEGER,
    "durationYears" INTEGER,
    "sourceUrl" TEXT,
    "lastChecked" TIMESTAMP(3),

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tracks_name_studyProgramId_key" ON "tracks"("name", "studyProgramId");

-- AddForeignKey
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_studyProgramId_fkey" FOREIGN KEY ("studyProgramId") REFERENCES "study_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
