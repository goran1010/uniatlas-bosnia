/*
  Warnings:

  - The `post` column on the `postal_codes` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "postOperator" AS ENUM ('BH_POSTA', 'POSTE_SRP', 'HP_MOSTAR');

-- AlterTable
ALTER TABLE "postal_codes" DROP COLUMN "post",
ADD COLUMN     "post" "postOperator";

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "Session"("sid");
