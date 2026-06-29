/*
  Warnings:

  - You are about to drop the column `newCity` on the `pending_changes_postal_code` table. All the data in the column will be lost.
  - You are about to drop the column `newPost` on the `pending_changes_postal_code` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pending_changes_postal_code" DROP COLUMN "newCity",
DROP COLUMN "newPost",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "post" "postOperator";
