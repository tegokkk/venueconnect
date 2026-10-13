# Baseline Diagram Sistem VenueConnect Polinela

> Versi baseline proyek per 12 Oktober 2026. Diagram direkonsiliasi terhadap proposal FIX, keputusan pengguna untuk task proses 1–9, PRD, dan schema Prisma saat ini. User menyetujui baseline proyek; dokumen ini bukan pengesahan institusi. Produksi tetap nonaktif. Bagian yang belum ada di schema atau memerlukan kewenangan institusi ditandai jelas.

## 1. Use case dan batas sistem

```mermaid
flowchart LR
  visitor[Pengunjung publik]
  student[Pemohon mahasiswa]
  staff[Pemohon dosen / pegawai]
  renter[Penyewa publik]
  operator[Pengelola / Subbagian Rumah Tangga]
  approver[Pengambil keputusan sesuai assignment]
  verifier[Verifier pembayaran BLU]
  officer[Petugas gedung]
  ai[Asisten informasi]

  subgraph vc[VenueConnect - baseline non-produksi]
    catalog((Cari gedung dan fasilitas))
    calendar((Lihat tarif dan slot publik))
    submit((Kirim pengajuan))
    own((Lihat status dan riwayat sendiri))
    document((Lampirkan berkas mahasiswa))
    review((Periksa kelengkapan dan catat tindak lanjut))
    decide((Catat keputusan sesuai assignment))
    payment((Catat dan verifikasi transfer manual))
    handover((Catat serah-terima dan pengembalian kunci))
    manage((Kelola gedung, tarif, jadwal dan blokir))
    answer((Cari informasi melalui fungsi baca-saja))
  end

  visitor --> catalog
  visitor --> calendar
  visitor --> answer
  student --> catalog
  student --> calendar
  student --> submit
  student --> document
  student --> own
  staff --> catalog
  staff --> calendar
  staff --> submit
  staff --> own
  renter --> catalog
  renter --> calendar
  renter --> submit
  renter --> own
  operator --> review
  operator --> manage
  approver --> decide
  verifier --> payment
  officer --> handover
  ai --> answer
```

Tidak ada use case mahasiswa untuk approval Wakil Direktur III. Dosen/pegawai dan penyewaan publik tidak diikat ke nama jabatan approver; user/role assignment harus diberikan pemilik proses. Kalender publik hanya mengirim waktu/status umum.

## 2. Flowchart dan activity alur pengajuan

### Pemeriksaan awal dan keputusan bersama

```mermaid
flowchart TD
  start((Mulai)) --> browse[Cari gedung, lihat jadwal dan informasi yang disahkan]
  browse --> category{Pilih kategori pemohon}
  category -->|Mahasiswa| student[Isi data minimum dan pilih satu berkas PDF]
  category -->|Dosen / pegawai| internal[Isi data minimum pengajuan internal]
  category -->|Publik| public[Isi data minimum penyewaan]
  student --> validate{Lengkap dan valid?}
  internal --> validate
  public --> validate
  validate -->|Tidak| fix[Koreksi field atau berkas; belum ada transaksi]
  fix --> validate
  validate -->|Ya| submitted[SUBMITTED; catat referensi; jangan tahan slot]
  submitted --> operator[Pengelola memulai pemeriksaan: UNDER_REVIEW]
  operator --> complete{Kelengkapan dan jadwal sesuai?}
  complete -->|Tidak| revise[REVISION_REQUESTED dengan catatan untuk pemohon]
  revise --> applicantFix[Pemohon memperbaiki dan mengirim ulang]
  applicantFix --> submitted
  complete -->|Ya| route{Tipe pengajuan}
  route -->|Internal| internalDecision[Keputusan oleh pengelola / assignee yang ditetapkan]
  route -->|Rental publik| bluReview[Pemeriksaan dan assignment proses aset BLU]
  bluReview --> rentalDecision[Keputusan sewa oleh assignee yang ditetapkan]
  internalDecision --> outcome{Hasil keputusan}
  rentalDecision --> outcome
  outcome -->|Ditolak| rejected[REJECTED dan catatan yang dapat dibagikan]
  outcome -->|Perlu perbaikan| revise
  outcome -->|Internal disetujui| confirmedInternal[CONFIRMED; kunci slot]
  outcome -->|Rental disetujui| awaitingPayment[AWAITING_PAYMENT; kunci slot menurut baseline]
  awaitingPayment --> manualPay[Transfer manual ke rekening resmi setelah instruksi BLU]
  manualPay --> verify{Verifier BLU memeriksa bukti dan nominal}
  verify -->|Belum cocok / gagal| manualFollowup[Tindak lanjut manual; jangan konfirmasi]
  manualFollowup --> manualPay
  verify -->|Terverifikasi| confirmedRental[CONFIRMED; kunci slot]
  confirmedInternal --> handover[Petugas mencatat serah-terima, pengembalian dan penyelesaian]
  confirmedRental --> handover
  handover --> done[COMPLETED]
```

### Activity diagram dengan tanggung jawab

```mermaid
flowchart LR
  subgraph applicant[Pemohon]
    A1[Pilih kategori, gedung dan waktu]
    A2[Isi kegiatan dan data minimum]
    A3{Mahasiswa?}
    A4[Siapkan satu PDF, maksimal 5 MB pada baseline proyek]
    A5[Kirim atau perbaiki pengajuan]
    A6[Lihat status dan catatan]
    A7[Transfer manual setelah tagihan BLU]
  end
  subgraph system[Sistem]
    S1[Validasi field, ukuran/tipe preview, dan interval waktu]
    S2{Valid?}
    S3[Catat SUBMITTED dan riwayat; slot tidak ditahan]
    S4[Tampilkan UNDER_REVIEW]
    S5[Tampilkan keputusan dan langkah berikutnya]
    S6[Catat AWAITING_PAYMENT]
    S7[Konfirmasi setelah pembayaran diverifikasi]
  end
  subgraph operator[Pengelola]
    O1[Periksa berkas, kelengkapan, dan jadwal]
    O2{Perlu revisi?}
    O3[Tulis catatan dan minta revisi]
    O4[Catat keputusan atau teruskan ke assignee resmi]
  end
  subgraph finance[Verifier BLU]
    F1[Verifikasi transfer terhadap tagihan]
  end
  subgraph facility[Petugas gedung]
    G1[Catat serah-terima/pengembalian kunci]
    G2[Tutup penggunaan]
  end

  A1 --> A2 --> A3
  A3 -->|Ya| A4 --> S1
  A3 -->|Tidak| S1
  S1 --> S2
  S2 -->|Tidak| A2
  S2 -->|Ya| S3 --> S4 --> O1 --> O2
  O2 -->|Ya| O3 --> S5 --> A5 --> S1
  O2 -->|Tidak| O4 --> S5 --> A6
  O4 -->|Internal disetujui| S7
  O4 -->|Rental disetujui| S6 --> A7 --> F1 --> S7
  S7 --> G1 --> G2
```

Aturan baseline: mahasiswa tidak diarahkan ke WD III dan keputusan tidak otomatis; Subbagian Rumah Tangga/pengelola mencatat pemeriksaan, catatan, aktor, dan waktu. Hanya `AWAITING_PAYMENT` dan `CONFIRMED` mengunci slot. Nilai jam, kapasitas, durasi, buffer, SLA, expiry, serta siapa assignee aktif harus dikonfigurasi setelah konfirmasi institusi. Prototipe statis tidak mengirim file; UI development kini memakai route upload privat.

## 3. ERD konseptual untuk baseline produk

ERD ini adalah desain konseptual yang mengikuti `backend/prisma/schema.prisma`. `Booking.applicantCategory` dan `User.accountCategory` ada pada schema serta migration yang sudah diterapkan pada PostgreSQL development lokal; kategori akun server membatasi pilihan kategori formulir. Verifikasi identitas saat provisioning akun tetap membutuhkan keputusan institusi.

```mermaid
erDiagram
  USER ||--o{ USER_ROLE : has
  ROLE ||--o{ USER_ROLE : assigned
  USER ||--o{ BOOKING : requests
  BUILDING ||--o{ BOOKING : receives
  BUILDING ||--o{ BUILDING_RATE : prices
  BUILDING ||--o{ BUILDING_FACILITY : offers
  FACILITY ||--o{ BUILDING_FACILITY : included
  BOOKING ||--o{ APPROVAL_STEP : routes
  ROLE o|--o{ APPROVAL_STEP : eligible_role
  USER o|--o{ APPROVAL_STEP : assigned_user
  APPROVAL_STEP ||--o{ APPROVAL_HISTORY : records
  USER ||--o{ APPROVAL_HISTORY : decides
  BOOKING ||--o{ PAYMENT : has
  USER o|--o{ PAYMENT : verifies
  BUILDING ||--o{ BUILDING_BLOCK : blocks
  BOOKING ||--o| USAGE_HANDOVER : handover
  USER ||--o{ USAGE_HANDOVER : officer
  BOOKING ||--o{ BOOKING_STATUS_HISTORY : changes
  USER o|--o{ BOOKING_STATUS_HISTORY : actor
  USER ||--o{ NOTIFICATION : receives
  BOOKING ||--o{ BOOKING_DOCUMENT : attaches
  USER ||--o{ BOOKING_DOCUMENT : uploads
  USER o|--o{ AUDIT_EVENT : acts

  USER {
    uuid id PK
    string email UK
    string name
    enum userType
    enum accountCategory
    boolean isActive
  }
  ROLE {
    uuid id PK
    enum name UK
  }
  USER_ROLE {
    uuid id PK
    uuid userId FK
    uuid roleId FK
  }
  BUILDING {
    uuid id PK
    string slug UK
    string name
    int capacity
    boolean isActive
    boolean publicRentalEnabled
  }
  FACILITY {
    uuid id PK
    string name UK
  }
  BUILDING_FACILITY {
    uuid buildingId FK
    uuid facilityId FK
    string detail
  }
  BUILDING_RATE {
    uuid id PK
    uuid buildingId FK
    string name
    enum audienceType
    decimal amount
    string unit
    datetime validFrom
    datetime validUntil
    uuid approvedById FK
  }
  BOOKING {
    uuid id PK
    uuid requesterId FK
    uuid buildingId FK
    enum bookingType
    enum applicantCategory
    string publicReference UK
    string eventName
    datetime startsAt
    datetime endsAt
    enum status
    json rateSnapshot
  }
  APPROVAL_STEP {
    uuid id PK
    uuid bookingId FK
    uuid assigneeId FK
    uuid roleId FK
    int stepNumber
    enum status
  }
  APPROVAL_HISTORY {
    uuid id PK
    uuid stepId FK
    uuid actorId FK
    enum outcome
    string note
    datetime decidedAt
  }
  PAYMENT {
    uuid id PK
    uuid bookingId FK
    decimal amount
    string currency
    string method
    enum status
    uuid verifiedById FK
    datetime dueAt
  }
  BUILDING_BLOCK {
    uuid id PK
    uuid buildingId FK
    datetime startsAt
    datetime endsAt
    string reason
  }
  USAGE_HANDOVER {
    uuid id PK UK
    uuid bookingId FK UK
    uuid officerId FK
    datetime keyGivenAt
    datetime keyReturnedAt
  }
  BOOKING_STATUS_HISTORY {
    uuid id PK
    uuid bookingId FK
    uuid actorId FK
    enum fromStatus
    enum toStatus
    datetime createdAt
  }
  BOOKING_DOCUMENT {
    uuid id PK
    uuid bookingId FK
    uuid uploadedById FK
    string fileName
    int fileSize
    string mimeType
    string storageKey
  }
  NOTIFICATION {
    uuid id PK
    uuid userId FK
    string type
    string resourceId
    datetime readAt
  }
  AUDIT_EVENT {
    uuid id PK
    uuid actorId FK
    string action
    string entityType
    string entityId
    json metadata
  }
```

Kontrol dokumen harus privat. Isi dokumen tidak dimasukkan ke audit log. Baseline proyek mengusulkan satu PDF maksimal 5 MB dan masa simpan 90 hari sesudah status terminal, tetapi upload, backup, dan penghapusan otomatis tetap nonaktif sebelum sign-off TI/pemilik arsip.

## 4. Diagram kelas dan komponen layanan

```mermaid
classDiagram
  class Booking {
    +id: UUID
    +requesterId: UUID
    +buildingId: UUID
    +bookingType: BookingType
    +applicantCategory: ApplicantCategory
    +startsAt: DateTime
    +endsAt: DateTime
    +status: BookingStatus
    +submit()
    +requestRevision(note)
    +decide(outcome, note)
  }
  class User {
    +id: UUID
    +userType: UserType
    +accountCategory: ApplicantCategory?
  }
  class BookingDocument {
    +id: UUID
    +bookingId: UUID
    +fileName: String
    +fileSize: Int
    +mimeType: String
    +storageKey: String
  }
  class ApprovalStep {
    +bookingId: UUID
    +stepNumber: Int
    +assigneeId: UUID?
    +roleId: UUID?
    +status: ApprovalStatus
  }
  class ApprovalHistory {
    +stepId: UUID
    +actorId: UUID
    +outcome: ApprovalStatus
    +note: String?
    +decidedAt: DateTime
  }
  class Payment {
    +bookingId: UUID
    +amount: Decimal
    +method: String?
    +status: PaymentStatus
    +verifiedById: UUID?
    +verify()
  }
  class Building
  class BuildingRate
  class AvailabilityService {
    +isAvailable(buildingId, startsAt, endsAt)
  }
  class BookingService {
    +createDraft(input)
    +submit(bookingId)
    +requestRevision(bookingId, note)
  }
  class ApprovalService {
    +decide(bookingId, actorId, outcome, note)
  }
  class PaymentService {
    +recordManualPayment(bookingId, requesterId, reference)
    +verify(paymentId, actorId)
  }
  class UsageService {
    +handover(bookingId, officerId)
    +returnKey(bookingId, officerId)
    +complete(bookingId)
  }
  class AuditService
  class NotificationService

  Booking "1" *-- "0..*" BookingDocument
  User "1" --> "0..*" Booking
  Booking "1" *-- "0..*" ApprovalStep
  ApprovalStep "1" *-- "0..*" ApprovalHistory
  Booking "1" *-- "0..*" Payment
  Building "1" --> "0..*" Booking
  Building "1" --> "0..*" BuildingRate
  BookingService --> AvailabilityService
  ApprovalService --> AvailabilityService
  BookingService --> AuditService
  ApprovalService --> AuditService
  ApprovalService --> NotificationService
  PaymentService --> AuditService
  PaymentService --> NotificationService
  UsageService --> AuditService
  UsageService --> NotificationService
```

`ApplicantCategory` sudah dicantumkan pada schema dan migration development yang diterapkan pada PostgreSQL lokal tanggal 2026-10-12. Use case, alur, ERD, dan class diagram ini telah disejajarkan sebagai baseline proyek; validasi identitas, assignment, serta persetujuan pemilik proses dan TI tetap merupakan gerbang sebelum produksi.
