/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isContributor` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "role" AS ENUM ('ADMIN', 'CONTRIBUTOR', 'USER');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isAdmin",
DROP COLUMN "isContributor",
ADD COLUMN     "role" "role" NOT NULL DEFAULT 'USER';
