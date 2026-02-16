-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE';
