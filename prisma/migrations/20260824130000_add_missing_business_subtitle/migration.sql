-- AlterTable
-- `businessSubtitle` was present in schema.prisma but had never shipped a
-- migration, so `Merchant.create()` failed on any fresh database.
ALTER TABLE "Merchant" ADD COLUMN     "businessSubtitle" TEXT;
