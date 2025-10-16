-- AlterTable
ALTER TABLE "public"."Coupon" ADD COLUMN     "percent" INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE "public"."Wallet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GiftCards" (
    "id" SERIAL NOT NULL,
    "cardCode" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 100,
    "redeemedBy" INTEGER,

    CONSTRAINT "GiftCards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GiftCards_cardCode_key" ON "public"."GiftCards"("cardCode");
