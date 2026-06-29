/*
  Warnings:

  - The primary key for the `postal_codes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `postal_codes` table. All the data in the column will be lost.
  - You are about to drop the `pending_changes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "pending_changes" DROP CONSTRAINT "pending_changes_userId_fkey";

-- DropIndex
DROP INDEX "postal_codes_code_key";

-- AlterTable
ALTER TABLE "postal_codes" DROP CONSTRAINT "postal_codes_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "postal_codes_pkey" PRIMARY KEY ("code");

-- DropTable
DROP TABLE "pending_changes";

-- CreateTable
CREATE TABLE "pending_changes_postal_code" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "typeOfChange" "typeOfChange" NOT NULL,
    "tableName" TEXT NOT NULL,
    "newCity" TEXT,
    "newPost" "postOperator",
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_changes_postal_code_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pending_changes_postal_code" ADD CONSTRAINT "pending_changes_postal_code_code_fkey" FOREIGN KEY ("code") REFERENCES "postal_codes"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_changes_postal_code" ADD CONSTRAINT "pending_changes_postal_code_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
