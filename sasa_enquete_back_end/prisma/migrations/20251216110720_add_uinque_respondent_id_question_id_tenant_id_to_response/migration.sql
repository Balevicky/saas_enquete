/*
  Warnings:

  - A unique constraint covering the columns `[respondentId,questionId,tenantId]` on the table `Response` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Response_respondentId_questionId_tenantId_key" ON "Response"("respondentId", "questionId", "tenantId");
