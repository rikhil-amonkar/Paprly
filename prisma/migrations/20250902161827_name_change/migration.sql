/*
  Warnings:

  - You are about to drop the column `authors` on the `Paper` table. All the data in the column will be lost.
  - You are about to drop the column `pdfUrl` on the `Paper` table. All the data in the column will be lost.
  - You are about to drop the column `venue` on the `Paper` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Paper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "abstract" TEXT DEFAULT '',
    "problem" TEXT,
    "method" TEXT,
    "results" TEXT,
    "limitations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "contributors" TEXT DEFAULT '',
    "arxivId" TEXT,
    "url" TEXT,
    "year" INTEGER
);
INSERT INTO "new_Paper" ("abstract", "arxivId", "createdAt", "id", "limitations", "method", "problem", "results", "title", "updatedAt", "url", "year") SELECT "abstract", "arxivId", "createdAt", "id", "limitations", "method", "problem", "results", "title", "updatedAt", "url", "year" FROM "Paper";
DROP TABLE "Paper";
ALTER TABLE "new_Paper" RENAME TO "Paper";
CREATE UNIQUE INDEX "Paper_arxivId_key" ON "Paper"("arxivId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
