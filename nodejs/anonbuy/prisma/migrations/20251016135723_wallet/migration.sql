-- AlterTable
ALTER TABLE "public"."Coupon" ADD COLUMN     "percent" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "public"."Wallet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);
