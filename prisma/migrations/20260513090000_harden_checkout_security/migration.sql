-- Track coupon reservations separately from paid coupon consumption so unpaid
-- pending orders cannot hold coupon capacity forever.
ALTER TABLE "Order"
ADD COLUMN "couponReservedAt" TIMESTAMP(3),
ADD COLUMN "couponConsumedAt" TIMESTAMP(3);

UPDATE "Order"
SET "couponConsumedAt" = COALESCE("confirmedAt", "updatedAt", "createdAt")
WHERE "couponId" IS NOT NULL
  AND "paymentStatus" = 'PAID';

UPDATE "Order"
SET "couponReservedAt" = "createdAt"
WHERE "couponId" IS NOT NULL
  AND "paymentStatus" <> 'PAID'
  AND "status" <> 'CANCELLED';

CREATE INDEX "Order_couponId_couponReservedAt_idx"
ON "Order"("couponId", "couponReservedAt");

-- Record processed provider webhook events to reject exact replays.
CREATE TABLE "WebhookEvent" (
  "id" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "checksum" TEXT,
  "payload" JSONB,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),

  CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WebhookEvent_provider_eventId_key"
ON "WebhookEvent"("provider", "eventId");

CREATE INDEX "WebhookEvent_provider_receivedAt_idx"
ON "WebhookEvent"("provider", "receivedAt");
