/*
  Warnings:

  - The values [RESTAVFALL,GLASSAVFALL,GLASSOGMETALL,METALLAVFALL,HUSHOLDNINGSAVFALL,NAERINGSAVFALL,FARLIGAVFALL,BYGGOGANLEGGSAVFALL,GJENVINNING,SPESIALAVFALL,ORGANISKAVFALL,ELEKTRONISKAVFALL] on the enum `AgreementType` will be removed. If these variants are still used in the database, this will fail.
  - The values [MONTHLY,ANNUALLY] on the enum `RepetitionFrequency` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AgreementType_new" AS ENUM ('RESIDUAL_WASTE', 'GLASS_WASTE', 'GLASS_AND_METAL', 'METAL_WASTE', 'HOUSEHOLD_WASTE', 'COMMERCIAL_WASTE', 'HAZARDOUS_WASTE', 'CONSTRUCTION_AND_DEMOLITION_WASTE', 'RECYCLING', 'SPECIAL_WASTE', 'ORGANIC_WASTE', 'ELECTRONIC_WASTE');
ALTER TABLE "Agreement" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Agreement" ALTER COLUMN "type" TYPE "AgreementType_new" USING ("type"::text::"AgreementType_new");
ALTER TYPE "AgreementType" RENAME TO "AgreementType_old";
ALTER TYPE "AgreementType_new" RENAME TO "AgreementType";
DROP TYPE "AgreementType_old";
ALTER TABLE "Agreement" ALTER COLUMN "type" SET DEFAULT 'RESIDUAL_WASTE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RepetitionFrequency_new" AS ENUM ('NONE', 'DAILY', 'WEEKLY');
ALTER TABLE "Agreement" ALTER COLUMN "repetition" DROP DEFAULT;
ALTER TABLE "Agreement" ALTER COLUMN "repetition" TYPE "RepetitionFrequency_new" USING ("repetition"::text::"RepetitionFrequency_new");
ALTER TYPE "RepetitionFrequency" RENAME TO "RepetitionFrequency_old";
ALTER TYPE "RepetitionFrequency_new" RENAME TO "RepetitionFrequency";
DROP TYPE "RepetitionFrequency_old";
ALTER TABLE "Agreement" ALTER COLUMN "repetition" SET DEFAULT 'NONE';
COMMIT;

-- AlterTable
ALTER TABLE "Agreement" ALTER COLUMN "type" SET DEFAULT 'RESIDUAL_WASTE';
