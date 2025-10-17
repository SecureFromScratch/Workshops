/*
  Warnings:

  - You are about to drop the column `createdAt` on the `CouponRedemption` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CouponRedemption` table. All the data in the column will be lost.
  - Added the required column `orderId` to the `CouponRedemption` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."CouponRedemption_couponId_idx";

-- DropIndex
DROP INDEX "public"."CouponRedemption_userId_couponId_idx";

-- AlterTable
ALTER TABLE "public"."CouponRedemption" DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "orderId" INTEGER NOT NULL,
ADD COLUMN     "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "CouponRedemption_orderId_idx" ON "public"."CouponRedemption"("orderId");

-- CreateIndex
CREATE INDEX "CouponRedemption_orderId_couponId_idx" ON "public"."CouponRedemption"("orderId", "couponId");

-- AddForeignKey
ALTER TABLE "public"."CouponRedemption" ADD CONSTRAINT "CouponRedemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
