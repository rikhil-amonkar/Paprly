/*
  Warnings:

  - A unique constraint covering the columns `[arxivId]` on the table `Paper` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Paper_arxivId_key" ON "Paper"("arxivId");
