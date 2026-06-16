/*
  Warnings:

  - You are about to drop the column `tableName` on the `pending_changes_postal_code` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pending_changes_postal_code" DROP COLUMN "tableName";
