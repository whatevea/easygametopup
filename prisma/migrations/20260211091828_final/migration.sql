-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "metadata" JSONB;
