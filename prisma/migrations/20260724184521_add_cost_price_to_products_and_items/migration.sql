-- AlterTable
ALTER TABLE "InvoiceItem" ADD COLUMN     "costPrice" DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "costPrice" DECIMAL(10,2) NOT NULL DEFAULT 0.00;
