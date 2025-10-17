/*
  Warnings:

  - You are about to drop the column `userId` on the `Wallet` table. All the data in the column will be lost.
  - You are about to alter the column `balance` on the `Wallet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(8,2)`.
  - A unique constraint covering the columns `[code]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Wallet" DROP COLUMN "userId",
ADD COLUMN     "code" TEXT NOT NULL,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(8,2);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_code_key" ON "public"."Wallet"("code");
