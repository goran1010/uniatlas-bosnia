/*
  Warnings:

  - The values [PUBLIC,PRIVATE] on the enum `ownership` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ownership_new" AS ENUM ('JAVNA', 'PRIVATNA');
ALTER TABLE "universities" ALTER COLUMN "ownership" TYPE "ownership_new" USING ("ownership"::text::"ownership_new");
ALTER TYPE "ownership" RENAME TO "ownership_old";
ALTER TYPE "ownership_new" RENAME TO "ownership";
DROP TYPE "public"."ownership_old";
COMMIT;
