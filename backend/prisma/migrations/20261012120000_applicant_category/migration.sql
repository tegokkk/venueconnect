CREATE TYPE "ApplicantCategory" AS ENUM ('MAHASISWA', 'DOSEN_PEGAWAI', 'UMUM');

ALTER TABLE "Booking"
ADD COLUMN "applicantCategory" "ApplicantCategory";

CREATE INDEX "Booking_applicantCategory_status_idx"
ON "Booking"("applicantCategory", "status");
