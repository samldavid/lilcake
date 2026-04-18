-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cartVersion" INTEGER NOT NULL DEFAULT 0;

UPDATE "User"
SET "cartVersion" = 1
WHERE "cartVersion" = 0
  AND EXISTS (
    SELECT 1
    FROM "Order"
    WHERE "Order"."userId" = "User"."id"
      AND "Order"."paymentStatus" = 'PAID'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM "CartItem"
    WHERE "CartItem"."userId" = "User"."id"
  );
