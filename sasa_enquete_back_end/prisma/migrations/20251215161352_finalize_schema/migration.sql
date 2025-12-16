/*
  Warnings:

  - You are about to drop the column `answers` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the column `meta` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the column `surveyId` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Survey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,tenantId]` on the table `Invite` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `questionId` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `respondentId` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Survey` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('NUMBER', 'SCALE', 'TEXT', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE');

-- DropForeignKey
ALTER TABLE "Response" DROP CONSTRAINT "Response_surveyId_fkey";

-- AlterTable
ALTER TABLE "Response" DROP COLUMN "answers",
DROP COLUMN "meta",
DROP COLUMN "surveyId",
ADD COLUMN     "answer" JSONB,
ADD COLUMN     "questionId" TEXT NOT NULL,
ADD COLUMN     "respondentId" TEXT NOT NULL,
ADD COLUMN     "tenantId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Survey" DROP COLUMN "status",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Respondent" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "name" TEXT,
    "firstname" TEXT,
    "birthYear" INTEGER,
    "villageId" TEXT,
    "externalId" TEXT,
    "tenantId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "Respondent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SurveyResponse_tenantId_surveyId_idx" ON "SurveyResponse"("tenantId", "surveyId");

-- CreateIndex
CREATE INDEX "Respondent_tenantId_idx" ON "Respondent"("tenantId");

-- CreateIndex
CREATE INDEX "Respondent_villageId_idx" ON "Respondent"("villageId");

-- CreateIndex
CREATE INDEX "Respondent_completedAt_idx" ON "Respondent"("completedAt");

-- CreateIndex
CREATE INDEX "Question_surveyId_idx" ON "Question"("surveyId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_email_tenantId_key" ON "Invite"("email", "tenantId");

-- CreateIndex
CREATE INDEX "Response_tenantId_respondentId_idx" ON "Response"("tenantId", "respondentId");

-- CreateIndex
CREATE INDEX "Response_questionId_idx" ON "Response"("questionId");

-- CreateIndex
CREATE INDEX "Response_tenantId_questionId_idx" ON "Response"("tenantId", "questionId");

-- CreateIndex
CREATE INDEX "Survey_tenantId_idx" ON "Survey"("tenantId");

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respondent" ADD CONSTRAINT "Respondent_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respondent" ADD CONSTRAINT "Respondent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Respondent" ADD CONSTRAINT "Respondent_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "Respondent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
