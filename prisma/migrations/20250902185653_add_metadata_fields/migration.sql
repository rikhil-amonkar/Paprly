/*
  Warnings:

  - You are about to drop the column `year` on the `Paper` table. All the data in the column will be lost.
  - Made the column `arxivId` on table `Paper` required. This step will fail if there are existing NULL values in that column.
  - Made the column `url` on table `Paper` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Paper" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "arxivId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contributors" TEXT,
    "abstract" TEXT DEFAULT '',
    "problem" TEXT,
    "method" TEXT,
    "results" TEXT,
    "limitations" TEXT,
    "datePublished" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Paper" ("abstract", "arxivId", "contributors", "createdAt", "id", "limitations", "method", "problem", "results", "title", "updatedAt", "url") SELECT "abstract", "arxivId", "contributors", "createdAt", "id", "limitations", "method", "problem", "results", "title", "updatedAt", "url" FROM "Paper";
DROP TABLE "Paper";
ALTER TABLE "new_Paper" RENAME TO "Paper";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
