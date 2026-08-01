-- Stock auto-tracking triggers.
--
-- SQLite serializes all writes to a database file (only one write
-- transaction commits at a time), so unlike Postgres these triggers don't
-- need an explicit row lock to stay race-safe under concurrent inserts.

-- Reject a sale that would take stock negative.
CREATE TRIGGER trg_sale_stock_check
BEFORE INSERT ON sales
FOR EACH ROW
WHEN (SELECT stockQty FROM skus WHERE id = NEW.skuId) < NEW.quantity
BEGIN
  SELECT RAISE(ABORT, 'Insufficient stock for this SKU');
END;

CREATE TRIGGER trg_sale_stock_decrement
AFTER INSERT ON sales
FOR EACH ROW
BEGIN
  UPDATE skus SET stockQty = stockQty - NEW.quantity WHERE id = NEW.skuId;
END;

CREATE TRIGGER trg_sale_stock_revert
AFTER DELETE ON sales
FOR EACH ROW
BEGIN
  UPDATE skus SET stockQty = stockQty + OLD.quantity WHERE id = OLD.skuId;
END;

CREATE TRIGGER trg_purchase_stock_increment
AFTER INSERT ON purchases
FOR EACH ROW
BEGIN
  UPDATE skus SET stockQty = stockQty + NEW.quantity WHERE id = NEW.skuId;
END;

CREATE TRIGGER trg_purchase_stock_revert
AFTER DELETE ON purchases
FOR EACH ROW
BEGIN
  UPDATE skus SET stockQty = stockQty - OLD.quantity WHERE id = OLD.skuId;
END;
