-- Add per-customer coupon limits and tracked usage
ALTER TABLE "Coupon"
ADD COLUMN "maxUsesPerUser" INTEGER;

CREATE TABLE "CouponCustomerUsage" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouponCustomerUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CouponCustomerUsage_couponId_userId_key"
ON "CouponCustomerUsage"("couponId", "userId");

CREATE INDEX "CouponCustomerUsage_userId_couponId_idx"
ON "CouponCustomerUsage"("userId", "couponId");

ALTER TABLE "CouponCustomerUsage"
ADD CONSTRAINT "CouponCustomerUsage_couponId_fkey"
FOREIGN KEY ("couponId") REFERENCES "Coupon"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CouponCustomerUsage"
ADD CONSTRAINT "CouponCustomerUsage_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
