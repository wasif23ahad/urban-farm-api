-- AlterTable
ALTER TABLE "SustainabilityCert" ADD COLUMN     "documentUrl" TEXT,
ADD COLUMN     "status" "CertStatus" NOT NULL DEFAULT 'PENDING';
