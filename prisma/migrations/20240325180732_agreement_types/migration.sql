/*
  Warnings:

  - The `type` column on the `Agreement` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AgreementType" AS ENUM ('RESIDUAL_WASTE', 'GLASS_WASTE', 'GLASS_AND_METAL', 'METAL_WASTE', 'HOUSEHOLD_WASTE', 'COMMERCIAL_WASTE', 'HAZARDOUS_WASTE', 'CONSTRUCTION_AND_DEMOLITION_WASTE', 'RECYCLING', 'SPECIAL_WASTE', 'ORGANIC_WASTE', 'ELECTRONIC_WASTE');

-- AlterTable
ALTER TABLE "Agreement" DROP COLUMN "type",
ADD COLUMN     "type" "AgreementType" NOT NULL DEFAULT 'RESIDUAL_WASTE';
