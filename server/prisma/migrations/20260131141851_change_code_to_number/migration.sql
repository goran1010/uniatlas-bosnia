/*
  Warnings:

  - Changed the type of `code` on the `postal_codes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "postal_codes" DROP COLUMN "code",
ADD COLUMN     "code" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "postal_codes_code_key" ON "postal_codes"("code");
