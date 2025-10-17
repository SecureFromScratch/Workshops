/*
  Warnings:

  - Added the required column `percent` to the `CouponRedemption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."CouponRedemption" ADD COLUMN     "percent" INTEGER NOT NULL;
