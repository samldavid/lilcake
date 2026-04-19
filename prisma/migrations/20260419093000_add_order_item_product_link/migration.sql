ALTER TABLE "OrderItem"
ADD COLUMN "productId" TEXT;

CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
