/*
  Warnings:

  - A unique constraint covering the columns `[id,tenantId]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId]` on the table `Respondent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId]` on the table `Response` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId]` on the table `Survey` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,tenantId]` on the table `SurveyResponse` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QuestionType" ADD VALUE 'TEXTAREA';
ALTER TYPE "QuestionType" ADD VALUE 'DATE';
ALTER TYPE "QuestionType" ADD VALUE 'EMAIL';
ALTER TYPE "QuestionType" ADD VALUE 'PHONE';

-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_respondentId_fkey";

-- DropForeignKey
ALTER TABLE "SurveyResponse" DROP CONSTRAINT "SurveyResponse_surveyId_fkey";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Survey" ADD COLUMN     "status" "SurveyStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE UNIQUE INDEX "Question_id_tenantId_key" ON "Question"("id", "tenantId");

-- CreateIndex
CREATE INDEX "Respondent_surveyId_idx" ON "Respondent"("surveyId");

-- CreateIndex
CREATE UNIQUE INDEX "Respondent_id_tenantId_key" ON "Respondent"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Response_id_tenantId_key" ON "Response"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Survey_id_tenantId_key" ON "Survey"("id", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_id_tenantId_key" ON "SurveyResponse"("id", "tenantId");

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "Respondent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
