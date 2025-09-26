/*
  Warnings:

  - You are about to drop the `CouponRedemptionVuln` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CouponRedemptionVuln" DROP CONSTRAINT "CouponRedemptionVuln_couponId_fkey";

-- DropIndex
DROP INDEX "public"."CouponRedemption_userId_couponId_key";

-- DropTable
DROP TABLE "public"."CouponRedemptionVuln";

-- CreateIndex
CREATE INDEX "CouponRedemption_userId_couponId_idx" ON "public"."CouponRedemption"("userId", "couponId");
