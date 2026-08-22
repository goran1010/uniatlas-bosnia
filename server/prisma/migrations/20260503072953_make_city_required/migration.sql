/*
  Warnings:

  - Made the column `city` on table `pending_changes_postal_code` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "pending_changes_postal_code" ALTER COLUMN "city" SET NOT NULL;
