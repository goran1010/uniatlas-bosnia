-- CreateTable
CREATE TABLE "postal_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "post" TEXT,

    CONSTRAINT "postal_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "postal_codes_code_key" ON "postal_codes"("code");
