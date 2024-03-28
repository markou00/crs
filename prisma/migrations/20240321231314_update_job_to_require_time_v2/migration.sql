/*
  Warnings:

  - You are about to drop the column `repeating` on the `Agreement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Agreement" DROP COLUMN "repeating",
ADD COLUMN     "repetition" "RepetitionFrequency" NOT NULL DEFAULT 'NONE';
