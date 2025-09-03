/*
  Warnings:

  - You are about to drop the column `abstract` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `Project` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "goal" TEXT DEFAULT '',
    "contributors" TEXT,
    "ideas" TEXT,
    "notes" TEXT DEFAULT '',
    "related" TEXT DEFAULT '',
    "queue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Project" ("contributors", "createdAt", "id", "title", "updatedAt") SELECT "contributors", "createdAt", "id", "title", "updatedAt" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
