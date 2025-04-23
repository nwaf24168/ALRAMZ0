/*
  Warnings:

  - You are about to drop the `Complaint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ComplaintUpdate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerServiceData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaintenanceSatisfaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MetricData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Complaint";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ComplaintUpdate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CustomerServiceData";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MaintenanceSatisfaction";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MetricData";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Metrics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "period" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Metrics_period_key" ON "Metrics"("period");
