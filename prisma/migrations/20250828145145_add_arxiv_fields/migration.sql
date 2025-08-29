/*
  Warnings:

  - The primary key for the `Paper` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `updatedAt` to the `Paper` table without a default value. This is not possible if the table is not empty.

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
    "authors" TEXT DEFAULT '',
    "arxivId" TEXT,
    "url" TEXT,
    "pdfUrl" TEXT,
    "venue" TEXT,
    "year" INTEGER
);
INSERT INTO "new_Paper" ("abstract", "createdAt", "id", "limitations", "method", "problem", "results", "title") SELECT "abstract", "createdAt", "id", "limitations", "method", "problem", "results", "title" FROM "Paper";
DROP TABLE "Paper";
ALTER TABLE "new_Paper" RENAME TO "Paper";
CREATE UNIQUE INDEX "Paper_arxivId_key" ON "Paper"("arxivId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
