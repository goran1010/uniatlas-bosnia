-- CreateEnum
CREATE TYPE "typeOfChange" AS ENUM ('UPDATE', 'DELETE', 'CREATE');

-- CreateTable
CREATE TABLE "pending_changes" (
    "id" TEXT NOT NULL,
    "typeOfChange" "typeOfChange" NOT NULL,
    "tableName" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "newData" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_changes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pending_changes" ADD CONSTRAINT "pending_changes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
