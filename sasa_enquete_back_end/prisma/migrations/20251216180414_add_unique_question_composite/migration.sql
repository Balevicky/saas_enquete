/*
  Warnings:

  - A unique constraint covering the columns `[surveyId,name,tenantId]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Question_surveyId_name_tenantId_key" ON "Question"("surveyId", "name", "tenantId");
