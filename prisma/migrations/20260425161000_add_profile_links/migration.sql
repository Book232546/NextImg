-- CreateEnum
CREATE TYPE "LinkPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'X', 'PATREON', 'KOFI', 'OTHER');

-- CreateTable
CREATE TABLE "ProfileLink" (
    "id" TEXT NOT NULL,
    "platform" "LinkPlatform" NOT NULL,
    "label" TEXT,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ProfileLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileLink_userId_sortOrder_idx" ON "ProfileLink"("userId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ProfileLink" ADD CONSTRAINT "ProfileLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
