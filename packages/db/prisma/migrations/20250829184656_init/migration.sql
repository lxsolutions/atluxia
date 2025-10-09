/*
  Warnings:

  - You are about to drop the `ChecklistItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentVaultItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reminder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VisaApplication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `kycStatus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ChecklistItem_completed_idx";

-- DropIndex
DROP INDEX "ChecklistItem_applicationId_idx";

-- DropIndex
DROP INDEX "DocumentVaultItem_type_idx";

-- DropIndex
DROP INDEX "DocumentVaultItem_userId_idx";

-- DropIndex
DROP INDEX "Profile_userId_key";

-- DropIndex
DROP INDEX "Reminder_completed_idx";

-- DropIndex
DROP INDEX "Reminder_dueDate_idx";

-- DropIndex
DROP INDEX "Reminder_userId_idx";

-- DropIndex
DROP INDEX "VisaApplication_status_idx";

-- DropIndex
DROP INDEX "VisaApplication_userId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ChecklistItem";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DocumentVaultItem";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Profile";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Reminder";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VisaApplication";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "address" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "amenities" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "maxGuests" INTEGER NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" REAL NOT NULL,
    "hasDedicatedWorkspace" BOOLEAN NOT NULL DEFAULT false,
    "wifiSpeed" INTEGER,
    "hasKitchen" BOOLEAN NOT NULL DEFAULT false,
    "hasLaundry" BOOLEAN NOT NULL DEFAULT false,
    "monthlyPrice" DECIMAL NOT NULL,
    "nightlyPrice" DECIMAL NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "trustScore" REAL DEFAULT 0.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "hostId" TEXT NOT NULL,
    CONSTRAINT "Property_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phone" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'guest',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "phone", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "phone", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
