ALTER TABLE "User"
ADD COLUMN "accountCategory" "ApplicantCategory";

ALTER TABLE "User"
ADD CONSTRAINT "User_account_category_matches_type"
CHECK (
  "accountCategory" IS NULL
  OR ("userType" = 'INTERNAL' AND "accountCategory" IN ('MAHASISWA', 'DOSEN_PEGAWAI'))
  OR ("userType" = 'EXTERNAL' AND "accountCategory" = 'UMUM')
);
