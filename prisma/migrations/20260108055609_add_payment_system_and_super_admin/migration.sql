/*
  Warnings:

  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "installationNotes" TEXT;
ALTER TABLE "Lead" ADD COLUMN "opsRemarks" TEXT;
ALTER TABLE "Lead" ADD COLUMN "opsStatus" TEXT;
ALTER TABLE "Lead" ADD COLUMN "printingNotes" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Payment";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "LeadPayment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leadId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_RAISED',
    "invoiceNo" TEXT,
    "totalAmount" DECIMAL NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL NOT NULL DEFAULT 0,
    "pendingAmount" DECIMAL NOT NULL DEFAULT 0,
    "dueDate" DATETIME,
    "clientCommitmentDate" DATETIME,
    "commitmentChannel" TEXT,
    "commitmentNote" TEXT,
    "lastFollowupAt" DATETIME,
    "lastFollowupNote" TEXT,
    "nextReminderAt" DATETIME,
    "stopReminders" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LeadPayment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leadPaymentId" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "mode" TEXT NOT NULL,
    "transactionRef" TEXT,
    "proofUrl" TEXT,
    "notes" TEXT,
    "paidAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentTransaction_leadPaymentId_fkey" FOREIGN KEY ("leadPaymentId") REFERENCES "LeadPayment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentFollowupNote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leadPaymentId" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentFollowupNote_leadPaymentId_fkey" FOREIGN KEY ("leadPaymentId") REFERENCES "LeadPayment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentReminderLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leadPaymentId" INTEGER NOT NULL,
    "recipientType" TEXT NOT NULL,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentReminderLog_leadPaymentId_fkey" FOREIGN KEY ("leadPaymentId") REFERENCES "LeadPayment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadCampaignItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leadId" INTEGER NOT NULL,
    "inventoryHoardingId" INTEGER NOT NULL,
    "rate" DECIMAL NOT NULL,
    "printingCharge" DECIMAL,
    "total" DECIMAL NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadCampaignItem_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LeadCampaignItem_inventoryHoardingId_fkey" FOREIGN KEY ("inventoryHoardingId") REFERENCES "InventoryHoarding" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DiscountRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" INTEGER NOT NULL,
    "requestedPercent" INTEGER NOT NULL,
    "approvedPercent" INTEGER,
    "reason" TEXT NOT NULL,
    "rejectionReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedByUserId" INTEGER NOT NULL,
    "approvedByAdminId" INTEGER,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME,
    "appliedAt" DATETIME,
    "tokenHash" TEXT,
    "tokenExpiresAt" DATETIME,
    "otpHash" TEXT,
    "otpExpiresAt" DATETIME,
    "otpAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiscountRequest_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DiscountRequest_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DiscountRequest_approvedByAdminId_fkey" FOREIGN KEY ("approvedByAdminId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DiscountRequest" ("appliedAt", "approvedAt", "approvedByAdminId", "approvedPercent", "createdAt", "id", "leadId", "reason", "rejectionReason", "requestedAt", "requestedByUserId", "requestedPercent", "status", "updatedAt") SELECT "appliedAt", "approvedAt", "approvedByAdminId", "approvedPercent", "createdAt", "id", "leadId", "reason", "rejectionReason", "requestedAt", "requestedByUserId", "requestedPercent", "status", "updatedAt" FROM "DiscountRequest";
DROP TABLE "DiscountRequest";
ALTER TABLE "new_DiscountRequest" RENAME TO "DiscountRequest";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "LeadPayment_leadId_key" ON "LeadPayment"("leadId");
