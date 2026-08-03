/*
  Warnings:

  - You are about to drop the column `pricePerItemPaise` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `skuId` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerItemPaise` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `skuId` on the `sales` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "purchase_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchaseId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "pricePerItemPaise" INTEGER NOT NULL,
    CONSTRAINT "purchase_items_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "purchase_items_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "skus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "pricePerItemPaise" INTEGER NOT NULL,
    CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sale_items_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "skus" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_purchases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT NOT NULL,
    "purchaseDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "purchases_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "purchases_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_purchases" ("createdAt", "createdById", "id", "purchaseDate", "vendorId") SELECT "createdAt", "createdById", "id", "purchaseDate", "vendorId" FROM "purchases";
DROP TABLE "purchases";
ALTER TABLE "new_purchases" RENAME TO "purchases";
CREATE TABLE "new_sales" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "saleDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sales_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sales_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_sales" ("clientId", "createdAt", "createdById", "id", "saleDate") SELECT "clientId", "createdAt", "createdById", "id", "saleDate" FROM "sales";
DROP TABLE "sales";
ALTER TABLE "new_sales" RENAME TO "sales";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Stock auto-tracking triggers, moved from purchases/sales (now order
-- headers with no skuId/quantity of their own) to the new item tables.
-- Dropping the old "purchases"/"sales" tables above already dropped their
-- old triggers automatically (SQLite drops a table's triggers with it).

CREATE TRIGGER trg_sale_item_stock_check
BEFORE INSERT ON sale_items
FOR EACH ROW
WHEN (SELECT stockQty FROM skus WHERE id = NEW.skuId) < NEW.quantity
BEGIN
  SELECT RAISE(ABORT, 'Insufficient stock for this SKU');
END;

CREATE TRIGGER trg_sale_item_stock_decrement
AFTER INSERT ON sale_items
FOR EACH ROW
BEGIN
  UPDATE skus SET stockQty = stockQty - NEW.quantity WHERE id = NEW.skuId;
END;

CREATE TRIGGER trg_sale_item_stock_revert
AFTER DELETE ON sale_items
FOR EACH ROW
BEGIN
  UPDATE skus SET stockQty = stockQty + OLD.quantity WHERE id = OLD.skuId;
END;

CREATE TRIGGER trg_purchase_item_stock_increment
AFTER INSERT ON purchase_items
FOR EACH ROW
BEGIN
  UPDATE skus SET stockQty = stockQty + NEW.quantity WHERE id = NEW.skuId;
END;

CREATE TRIGGER trg_purchase_item_stock_revert
AFTER DELETE ON purchase_items
FOR EACH ROW
BEGIN
  UPDATE skus SET stockQty = stockQty - OLD.quantity WHERE id = OLD.skuId;
END;
