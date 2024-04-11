-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "servicetype" TEXT NOT NULL DEFAULT 'outgoing',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'standard';
