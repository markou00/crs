/*
  Warnings:

  - You are about to drop the column `containerId` on the `Agreement` table. All the data in the column will be lost.
  - Added the required column `containerName` to the `Agreement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capacity` to the `Container` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rfid` to the `Container` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Container` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContainerStatus" AS ENUM ('available', 'unavailable');

-- DropForeignKey
ALTER TABLE "Agreement" DROP CONSTRAINT "Agreement_containerId_fkey";

-- AlterTable
ALTER TABLE "Agreement" DROP COLUMN "containerId",
ADD COLUMN     "containerName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Container" ADD COLUMN     "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "jobId" INTEGER,
ADD COLUMN     "rfid" TEXT NOT NULL,
ADD COLUMN     "status" "ContainerStatus" NOT NULL DEFAULT 'available',
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" INTEGER NOT NULL,
    "containerId" INTEGER,
    "agreementId" INTEGER,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_containerId_key" ON "Job"("containerId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE SET NULL ON UPDATE CASCADE;
