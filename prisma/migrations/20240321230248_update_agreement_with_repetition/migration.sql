-- CreateEnum
CREATE TYPE "RepetitionFrequency" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'ANNUALLY');

-- AlterTable
ALTER TABLE "Agreement" ADD COLUMN     "repeating" "RepetitionFrequency" NOT NULL DEFAULT 'NONE';

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "date" DROP NOT NULL;
