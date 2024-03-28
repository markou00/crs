/*
  Warnings:

  - You are about to drop the column `customerId` on the `Job` table. All the data in the column will be lost.
  - Made the column `tenantId` on table `Car` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tenantId` on table `Employee` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `date` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Made the column `agreementId` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Car" DROP CONSTRAINT "Car_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_agreementId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_customerId_fkey";

-- AlterTable
ALTER TABLE "Car" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "customerId",
ADD COLUMN     "carId" INTEGER,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "agreementId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL ON UPDATE CASCADE;
