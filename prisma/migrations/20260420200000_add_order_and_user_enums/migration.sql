CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CUSTOMER');

CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED'
);

CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

ALTER TABLE "User"
ALTER COLUMN "role" DROP DEFAULT,
ALTER COLUMN "role" TYPE "UserRole"
USING ("role"::text::"UserRole"),
ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';

ALTER TABLE "Order"
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "OrderStatus"
USING ("status"::text::"OrderStatus"),
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "paymentStatus" DROP DEFAULT,
ALTER COLUMN "paymentStatus" TYPE "PaymentStatus"
USING ("paymentStatus"::text::"PaymentStatus"),
ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING';

CREATE INDEX "Order_stripeSessionId_idx" ON "Order"("stripeSessionId");
