/*
  Warnings:

  - Added the required column `bgGlow` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `characteristics` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gradient` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idKey` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rarity` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subName` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Testimonial` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Order" (
    "orderNumber" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "shippingAddress" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Confirmed'
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subName" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "gradient" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "characteristics" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "bgGlow" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Product" ("createdAt", "description", "id", "image", "name", "price", "stock") SELECT "createdAt", "description", "id", "image", "name", "price", "stock" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_idKey_key" ON "Product"("idKey");
CREATE TABLE "new_Testimonial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "review" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Testimonial" ("createdAt", "id", "name", "rating", "review") SELECT "createdAt", "id", "name", "rating", "review" FROM "Testimonial";
DROP TABLE "Testimonial";
ALTER TABLE "new_Testimonial" RENAME TO "Testimonial";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
