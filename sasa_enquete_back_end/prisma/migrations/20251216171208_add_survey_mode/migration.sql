-- CreateEnum
CREATE TYPE "SurveyMode" AS ENUM ('SIMPLE', 'ADVANCED');

-- AlterTable
ALTER TABLE "Survey" ADD COLUMN     "mode" "SurveyMode" NOT NULL DEFAULT 'SIMPLE';
