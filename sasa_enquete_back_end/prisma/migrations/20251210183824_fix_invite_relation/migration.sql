-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_email_fkey";

-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
