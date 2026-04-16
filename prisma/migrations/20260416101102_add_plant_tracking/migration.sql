-- CreateEnum
CREATE TYPE "PlantStatus" AS ENUM ('HEALTHY', 'NEEDS_ATTENTION', 'DORMANT', 'HARVESTED');

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rentalSpaceId" TEXT,
    "name" TEXT NOT NULL,
    "species" TEXT,
    "growthStage" TEXT NOT NULL DEFAULT 'SEEDLING',
    "status" "PlantStatus" NOT NULL DEFAULT 'HEALTHY',
    "healthNotes" TEXT,
    "plantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastChecked" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plant" ADD CONSTRAINT "Plant_rentalSpaceId_fkey" FOREIGN KEY ("rentalSpaceId") REFERENCES "RentalSpace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
