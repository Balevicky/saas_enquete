-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "config" JSONB,
ADD COLUMN     "nextMap" JSONB,
ADD COLUMN     "options" JSONB;
