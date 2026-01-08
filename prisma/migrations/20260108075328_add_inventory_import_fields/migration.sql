/*
  Warnings:

  - Added the required column `locationName` to the `InventoryHoarding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outletName` to the `InventoryHoarding` table without a default value. This is not possible if the table is not empty.
  - Made the column `district` on table `InventoryHoarding` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InventoryHoarding" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceSrNo" INTEGER,
    "outletName" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT,
    "areaType" TEXT,
    "widthFt" DECIMAL,
    "heightFt" DECIMAL,
    "areaSqft" DECIMAL,
    "ratePerSqft" DECIMAL,
    "installationCharge" DECIMAL,
    "printingCharge" DECIMAL,
    "netTotal" DECIMAL,
    "computedArea" DECIMAL,
    "computedBaseCost" DECIMAL,
    "computedNetTotal" DECIMAL,
    "rawImportData" TEXT,
    "importBatchId" TEXT,
    "location" TEXT,
    "name" TEXT,
    "hoardingsCount" INTEGER NOT NULL DEFAULT 1,
    "width" DECIMAL,
    "height" DECIMAL,
    "totalArea" DECIMAL,
    "rate" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_InventoryHoarding" ("city", "createdAt", "district", "height", "hoardingsCount", "id", "location", "name", "netTotal", "printingCharge", "rate", "state", "totalArea", "updatedAt", "width") SELECT "city", "createdAt", "district", "height", "hoardingsCount", "id", "location", "name", "netTotal", "printingCharge", "rate", "state", "totalArea", "updatedAt", "width" FROM "InventoryHoarding";
DROP TABLE "InventoryHoarding";
ALTER TABLE "new_InventoryHoarding" RENAME TO "InventoryHoarding";
CREATE INDEX "InventoryHoarding_state_district_idx" ON "InventoryHoarding"("state", "district");
CREATE INDEX "InventoryHoarding_outletName_idx" ON "InventoryHoarding"("outletName");
CREATE INDEX "InventoryHoarding_importBatchId_idx" ON "InventoryHoarding"("importBatchId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
