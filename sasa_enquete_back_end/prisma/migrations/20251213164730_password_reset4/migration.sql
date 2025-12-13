-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_tenantId_idx" ON "PasswordResetToken"("userId", "tenantId");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
