-- AlterTable
ALTER TABLE "faculties" ADD COLUMN     "lastChecked" TIMESTAMP(3),
ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "study_programs" ADD COLUMN     "lastChecked" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "lastChecked" TIMESTAMP(3);
