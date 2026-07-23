-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "advanceReceived" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "paymentMethod" TEXT;
