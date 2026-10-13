ALTER TABLE "Building" ADD COLUMN "internalLoanEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BuildingRate" ADD COLUMN "isBookable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "BuildingRate" ADD COLUMN "maxDurationMinutes" INTEGER;
