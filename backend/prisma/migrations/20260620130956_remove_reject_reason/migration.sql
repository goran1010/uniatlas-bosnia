/*
  Warnings:

  - You are about to drop the column `rejectionReason` on the `pending_changes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pending_changes" DROP COLUMN "rejectionReason";
