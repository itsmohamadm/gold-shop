-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "karat" INTEGER NOT NULL DEFAULT 18,
    "laborPercent" REAL NOT NULL DEFAULT 20,
    "profitPercent" REAL NOT NULL DEFAULT 7,
    "taxPercent" REAL NOT NULL DEFAULT 10,
    "manualPrice" REAL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
