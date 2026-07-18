ALTER TABLE "Sale" ADD COLUMN "adminId" TEXT;
UPDATE "Sale" SET "adminId" = (SELECT id FROM "Admin" WHERE username = 'admin' LIMIT 1);
ALTER TABLE "Sale" ALTER COLUMN "adminId" SET NOT NULL;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE;
CREATE INDEX "Sale_adminId_idx" ON "Sale"("adminId");