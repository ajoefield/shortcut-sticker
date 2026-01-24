/*
  Warnings:

  - You are about to drop the `layout_shortcuts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `size` on the `layouts` table. All the data in the column will be lost.
  - Added the required column `data` to the `layouts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "layout_shortcuts_layoutId_position_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "layout_shortcuts";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_layouts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "layouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_layouts" ("createdAt", "id", "name", "updatedAt", "userId") SELECT "createdAt", "id", "name", "updatedAt", "userId" FROM "layouts";
DROP TABLE "layouts";
ALTER TABLE "new_layouts" RENAME TO "layouts";
CREATE TABLE "new_shortcuts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "keys" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'mac',
    "appId" TEXT NOT NULL,
    CONSTRAINT "shortcuts_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_shortcuts" ("appId", "description", "id", "keys", "platform") SELECT "appId", "description", "id", "keys", "platform" FROM "shortcuts";
DROP TABLE "shortcuts";
ALTER TABLE "new_shortcuts" RENAME TO "shortcuts";
CREATE UNIQUE INDEX "shortcuts_keys_appId_platform_key" ON "shortcuts"("keys", "appId", "platform");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
