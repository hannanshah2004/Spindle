-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_projectId_fkey";

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
