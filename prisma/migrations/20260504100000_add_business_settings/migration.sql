CREATE TABLE IF NOT EXISTS "BusinessSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "businessName" TEXT NOT NULL DEFAULT 'LilCake',
    "businessId" TEXT,
    "businessEmail" TEXT,
    "businessPhone" TEXT,
    "businessAddress" TEXT,
    "businessCity" TEXT,
    "salesNoteDisclaimer" TEXT,
    "logoUrl" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY ("id")
);
