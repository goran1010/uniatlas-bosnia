/*
  Warnings:

  - You are about to drop the `pending_changes_university` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,city]` on the table `universities` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "pending_changes_university" DROP CONSTRAINT "pending_changes_university_userId_fkey";

-- DropTable
DROP TABLE "pending_changes_university";

-- CreateTable
CREATE TABLE "pending_changes" (
    "id" TEXT NOT NULL,
    "entityType" "entityType" NOT NULL,
    "typeOfChange" "typeOfChange" NOT NULL,
    "targetId" INTEGER,
    "parentId" INTEGER,
    "data" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,

    CONSTRAINT "pending_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pending_changes_createdAt_idx" ON "pending_changes"("createdAt");

-- CreateIndex
CREATE INDEX "pending_changes_entityType_typeOfChange_idx" ON "pending_changes"("entityType", "typeOfChange");

-- CreateIndex
CREATE INDEX "pending_changes_targetId_idx" ON "pending_changes"("targetId");

-- CreateIndex
CREATE INDEX "pending_changes_parentId_idx" ON "pending_changes"("parentId");

-- CreateIndex
CREATE INDEX "pending_changes_userId_idx" ON "pending_changes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "universities_name_city_key" ON "universities"("name", "city");

-- AddForeignKey
ALTER TABLE "pending_changes" ADD CONSTRAINT "pending_changes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
