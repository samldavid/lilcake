ALTER TABLE "Order"
ADD COLUMN "customerEmail" TEXT,
ADD COLUMN "shippingCarrier" TEXT,
ADD COLUMN "confirmedAt" TIMESTAMP(3),
ADD COLUMN "shippedAt" TIMESTAMP(3),
ADD COLUMN "receiptEmailSentAt" TIMESTAMP(3),
ADD COLUMN "confirmationEmailSentAt" TIMESTAMP(3),
ADD COLUMN "shippingEmailSentAt" TIMESTAMP(3);

UPDATE "Order" AS o
SET "customerEmail" = u."email"
FROM "User" AS u
WHERE o."userId" = u."id"
  AND o."customerEmail" IS NULL
  AND u."email" IS NOT NULL;

CREATE INDEX "Order_customerEmail_idx" ON "Order"("customerEmail");
CREATE INDEX "Order_shippingCarrier_idx" ON "Order"("shippingCarrier");
CREATE INDEX "Order_trackingNumber_idx" ON "Order"("trackingNumber");
