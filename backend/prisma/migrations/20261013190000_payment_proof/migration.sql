ALTER TABLE "Payment"
  ADD COLUMN "proofStorageKey" TEXT,
  ADD COLUMN "proofFileName" TEXT,
  ADD COLUMN "proofFileSize" INTEGER,
  ADD COLUMN "proofMimeType" TEXT,
  ADD COLUMN "proofUploadedAt" TIMESTAMPTZ;

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_proof_metadata_complete" CHECK (
    (
      "proofStorageKey" IS NULL
      AND "proofFileName" IS NULL
      AND "proofFileSize" IS NULL
      AND "proofMimeType" IS NULL
      AND "proofUploadedAt" IS NULL
    ) OR (
      "proofStorageKey" IS NOT NULL
      AND "proofFileName" IS NOT NULL
      AND "proofFileSize" BETWEEN 8 AND 5242880
      AND "proofMimeType" IN ('application/pdf', 'image/jpeg', 'image/png')
      AND "proofUploadedAt" IS NOT NULL
    )
  );
