/*
  Warnings:

  - You are about to drop the column `idempotencyKey` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[walletCode]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `walletCode` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Order_idempotencyKey_key";

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "idempotencyKey",
ADD COLUMN     "walletCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_walletCode_key" ON "public"."Order"("walletCode");
