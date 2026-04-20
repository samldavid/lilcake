-- CreateTable
CREATE TABLE "AccountSecurityToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountSecurityToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountSecurityToken_tokenHash_key" ON "AccountSecurityToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AccountSecurityToken_userId_type_expiresAt_idx" ON "AccountSecurityToken"("userId", "type", "expiresAt");

-- AddForeignKey
ALTER TABLE "AccountSecurityToken" ADD CONSTRAINT "AccountSecurityToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
