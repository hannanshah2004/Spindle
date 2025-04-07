/*
  Warnings:

  - You are about to drop the column `nlpInstruction` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the `Context` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Context" DROP CONSTRAINT "Context_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Context" DROP CONSTRAINT "Context_userId_fkey";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "nlpInstruction";

-- DropTable
DROP TABLE "Context";

-- CreateTable
CREATE TABLE "SessionAction" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionAction_sessionId_idx" ON "SessionAction"("sessionId");

-- AddForeignKey
ALTER TABLE "SessionAction" ADD CONSTRAINT "SessionAction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
