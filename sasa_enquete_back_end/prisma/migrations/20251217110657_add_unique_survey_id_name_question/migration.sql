/*
  Warnings:

  - A unique constraint covering the columns `[surveyId,name]` on the table `Question` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Question_surveyId_name_key" ON "Question"("surveyId", "name");
