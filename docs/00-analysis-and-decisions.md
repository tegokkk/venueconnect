# Analisis Proyek dan Keputusan Lintas Dokumen

> Acuan lintas dokumen untuk lima spesifikasi VenueConnect. Dokumen ini membedakan fakta proposal, rekomendasi teknis, dan keputusan kebijakan yang harus disahkan Polinela. Rekomendasi teknis dapat dipakai sebagai baseline; kebijakan institusi tidak dianggap sah sebelum pemilik proses mengonfirmasi.

## Status kesiapan

Dokumen cukup untuk memulai kerangka aplikasi, prototipe UI, katalog contoh, dan pengembangan yang tidak mengubah data produksi. Booking nyata, kalender resmi, pembayaran, serta akses akun internal belum siap dirilis sampai keputusan bertanda BLOCKER dikonfirmasi.

## 1. Fakta dari proposal

| Area               | Acuan proposal                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Tujuan             | Digitalisasi informasi, peminjaman, penyewaan, pengelolaan gedung dan jadwal                                                  |
| Pengguna           | Mahasiswa, dosen, pegawai, masyarakat umum, admin/pengelola, pemberi persetujuan, petugas/pemegang kunci                      |
| Alur               | Lihat gedung/jadwal, ajukan, verifikasi/persetujuan, pembayaran sewa bila disetujui, serah-terima dan penyelesaian penggunaan |
| Rute/alur pengajuan | Dikonfirmasi pengguna: mahasiswa tidak menjalani approval Wakil Direktur III di dalam alur sistem. Proposal menjelaskan alur manual lama yang masih melibatkan WD III; fakta proses saat ini tidak mengubah keputusan sistem ini. Proposal §1.1 menyebut dosen/teknisi mengajukan ke Bagian Umum/Subbagian Rumah Tangga untuk pemeriksaan ketersediaan dan koordinasi petugas gedung; tidak menyebut approval Ketua Jurusan. Proposal menyebut sewa publik dikelola melalui aset BLU, tetapi tidak menetapkan WD II sebagai approver. |
| Pencegahan bentrok | Jadwal perlu diperiksa agar booking disetujui tidak bertumpang tindih                                                         |
| Teknologi          | JavaScript, Next.js, PostgreSQL, Prisma, Tailwind CSS, FullCalendar, Vercel AI SDK, Gemini API                                |
| AI                 | Membantu mencari informasi gedung, tarif, jadwal dan prosedur; keputusan tetap pada pengelola                                 |
| Pengembangan       | RAD dengan perencanaan kebutuhan, desain bersama pengguna, implementasi dan evaluasi                                          |

## 2. Rekomendasi baseline produk

Rekomendasi berikut membuat spesifikasi dapat diterjemahkan menjadi implementasi. Pemilik proses dapat mengubahnya sebelum transaksi produksi.

### Siklus booking

- Pemohon membuat DRAFT, mengisi formulir dan mengirim menjadi SUBMITTED.
- Pengelola memeriksa menjadi UNDER_REVIEW; hasil pemeriksaan dapat meminta revisi atau meneruskan ke AWAITING_APPROVAL.
- Keputusan akhir internal mengubah booking menjadi CONFIRMED dan langsung mengunci slot.
- Keputusan akhir penyewaan publik mengubah booking menjadi AWAITING_PAYMENT dan mengunci slot sementara.
- Pembayaran manual yang diverifikasi pengelola mengubah rental menjadi CONFIRMED.
- Jika tenggat pembayaran habis, booking menjadi EXPIRED dan slot dilepas.
- Penolakan menjadi REJECTED; pembatalan yang diizinkan menjadi CANCELLED; penggunaan selesai menjadi COMPLETED.
- Revisi mempertahankan riwayat lama; pemohon mengirim versi revisi sebagai langkah baru yang tercatat.

### Penguncian slot

Status yang menghalangi bentrok: AWAITING_PAYMENT dan CONFIRMED. Waktu memakai interval setengah terbuka [mulai, selesai), jadi dua booking boleh berdempetan tanpa overlap. Booking yang menunggu pemeriksaan/persetujuan tidak mengunci slot pada baseline. Sistem mengecek ulang saat pengiriman dan konfirmasi; constraint PostgreSQL menjadi perlindungan akhir terhadap dua persetujuan bersamaan.

Tenggat AWAITING_PAYMENT sebaiknya configurable per jenis gedung dan ditentukan pengelola. Nilai awal teknis dapat berupa 24 jam, tetapi jangan aktifkan default ini sebagai kebijakan produksi tanpa persetujuan BLU/pengelola.

### Approval dan otorisasi

- Admin/pengelola memeriksa kelengkapan dan alur.
- Revisi pengguna mengubah alur mahasiswa: mahasiswa mengunggah berkas peminjaman gedung; jangan membuat tugas approval Wakil Direktur III untuk mahasiswa di sistem.
- Proposal §1.1 hanya mencatat dosen/teknisi → Bagian Umum/Subbagian Rumah Tangga untuk cek ketersediaan dan koordinasi petugas gedung. Proposal juga mencatat sewa masyarakat umum melalui pengelolaan aset BLU, dari cek jadwal/tarif sampai tagihan, pembayaran rekening BLU, dan perjanjian. Approval Ketua Jurusan dan Wakil Direktur II, delegasi, urutan pemeriksaan, serta pengecualian gedung belum dinyatakan di proposal dan harus dikonfirmasi pemilik proses.
- Terapkan assignment persetujuan berdasarkan kategori pemohon melalui konfigurasi, bukan nama pejabat hard-coded. Konfirmasi format dan aturan dokumen mahasiswa, delegasi, serta pengecualian per gedung sebelum transaksi produksi.
- Hanya pemilik booking membaca data privat booking-nya.
- Approver hanya melihat booking yang ditugaskan.
- Petugas hanya melihat jadwal tugas dan mencatat serah-terima.
- Admin pengelola dapat memperbarui gedung/tarif/blokir sesuai kewenangan.
- Superadmin teknis (jika diperlukan) mengelola role tanpa otomatis berhak mengambil keputusan operasional.

| Kemampuan                                  | Publik        | Pemohon internal | Admin/pengelola                  | Approver                | Payment verifier            | Petugas                |
| ------------------------------------------ | ------------- | ---------------- | -------------------------------- | ----------------------- | --------------------------- | ---------------------- |
| Lihat katalog, tarif publik, kalender umum | Ya            | Ya               | Ya                               | Ya                      | Ya                          | Ya                     |
| Buat pengajuan                             | Setelah login | Ya               | Jika juga pemohon                | Jika juga pemohon       | Jika juga pemohon           | Jika juga pemohon      |
| Lihat detail privat booking                | Milik sendiri | Milik sendiri    | Sesuai assignment                | Yang ditugaskan         | Hanya bila perlu verifikasi | Yang perlu untuk tugas |
| Ubah data gedung/tarif/blokir              | Tidak         | Tidak            | Ya sesuai izin                   | Tidak                   | Tidak                       | Tidak                  |
| Putuskan pengajuan                         | Tidak         | Tidak            | Sesuai konfigurasi               | Yang ditugaskan         | Tidak                       | Tidak                  |
| Verifikasi pembayaran                      | Tidak         | Tidak            | Hanya jika juga payment verifier | Tidak                   | Yang ditugaskan             | Tidak                  |
| Catat serah-terima kunci                   | Tidak         | Tidak            | Jika ditugaskan                  | Tidak                   | Tidak                       | Untuk tugas            |
| Lihat audit                                | Tidak         | Riwayat sendiri  | Akses terbatas                   | Riwayat keputusan tugas | Riwayat pembayaran tugas    | Riwayat tugas          |

Semua izin tetap diperiksa backend. Rute kategori di atas berasal dari proposal revisi, tetapi pelimpahan kewenangan, susunan tahap, dan pengecualian operasional tetap perlu disahkan pemilik sistem.

### Data booking minimum

Form umum: gedung, tanggal, waktu mulai/selesai, nama kegiatan, tujuan singkat, jumlah peserta bila kapasitas relevan, nama dan kontak pemohon. Field internal/eksternal tambahan dan dokumen dibuat configurable setelah aturan resmi dikumpulkan. Jangan mengumpulkan NPM/NIP/KTP kecuali ada kebutuhan proses yang disetujui.

Tarif punya nama layanan, audienceType, satuan, periode berlaku, status publikasi, dan pemilik/pengesah. Booking sewa menyimpan snapshot tarif. Calendar publik menyajikan waktu/status saja tanpa identitas atau nama kegiatan.

#### Sumber tarif resmi 2026

Lampiran pengguna `1185 Tarif Layanan BLU 2026.pdf` memuat Keputusan Direktur Polinela No. 1185/PL15/KPTS/2026, ditetapkan 21 Agustus 2026. Lampirannya menjadi sumber resmi tarif BLU tahun 2026, satuan, kelompok pengguna, dan batas layanan yang tercantum. Contoh ruang: GSG lengkap videotron, 300 kursi, dan sound system sebesar Rp10.000.000 (umum), Rp9.000.000 (dosen/tendik/mitra), serta Rp8.000.000 (diskon mahasiswa), per hari maksimal 8 jam. Smartroom class Rp250.000 per jam dengan minimum 2 jam. Ruang seminar Gedung S Rp3.000.000 dan Gedung Q Rp2.000.000 per 8 jam.

Sebelum memasukkan semua baris ke master tarif, cocokkan nama layanan dengan inventaris gedung aktual. Kategori `umum`, `dosen/tendik/mitra`, dan `mahasiswa/UKM` juga lebih rinci daripada `INTERNAL`/`EXTERNAL`/`ALL`; jangan memetakan `mitra` atau `UKM` secara otomatis tanpa keputusan pemilik layanan. SK tarif ini tidak menggantikan syarat penggunaan umum, metode/verifikasi pembayaran, atau kebijakan booking.

**Keputusan pengguna 13 Oktober 2026:** peminjaman gedung adalah untuk mahasiswa, dosen, dan civitas akademika Politeknik Negeri Lampung dengan akun internal. Penyewaan adalah untuk orang atau instansi luar kampus dengan akun eksternal. Harga yang ditampilkan pada katalog, detail, dan asisten publik hanya tarif sewa luar kampus (`EXTERNAL`), apabila pemetaan tarif per gedung telah diverifikasi dan disahkan. Tarif `INTERNAL` atau `ALL` tidak dipublikasikan dan tidak menjadi fallback pengajuan sewa. Booking peminjaman internal tidak memakai snapshot tarif sewa. Kategori aplikasi `DOSEN_PEGAWAI` mencakup dosen serta pegawai/civitas internal non-mahasiswa; verifikasi keanggotaan akun sebelum produksi masih terbuka. Keputusan ini memperjelas segmen layanan proyek dan tidak otomatis menetapkan tarif atau izin publikasi resmi.

## 3. Spesifikasi status kanonik

Ini adalah status booking yang dipakai lintas backend, database, UI dan API:

| Status             | Makna                                                 | Mengunci slot? |
| ------------------ | ----------------------------------------------------- | -------------- |
| DRAFT              | Belum diajukan                                        | Tidak          |
| SUBMITTED          | Menunggu pemeriksaan awal                             | Tidak          |
| UNDER_REVIEW       | Sedang diperiksa pengelola                            | Tidak          |
| REVISION_REQUESTED | Pemohon perlu memperbaiki pengajuan                   | Tidak          |
| AWAITING_APPROVAL  | Menunggu keputusan pejabat/approver                   | Tidak          |
| AWAITING_PAYMENT   | Sewa disetujui, menunggu pembayaran sebelum tenggat   | Ya             |
| CONFIRMED          | Penggunaan internal disetujui atau sewa terverifikasi | Ya             |
| REJECTED           | Ditolak                                               | Tidak          |
| CANCELLED          | Dibatalkan melalui alur yang diizinkan                | Tidak          |
| EXPIRED            | Tenggat lewat atau booking kedaluwarsa                | Tidak          |
| COMPLETED          | Penggunaan selesai                                    | Tidak          |

Keputusan approval tetap dicatat pada ApprovalHistory. UI boleh menampilkan teks “Disetujui, menunggu pembayaran” untuk AWAITING_PAYMENT. Jangan memakai satu status APPROVED yang ambigu antara approval selesai dan slot benar-benar terkonfirmasi.

## 4. API contract bersama

- Prefix /api/v1.
- Waktu request/response berupa ISO 8601 dengan offset; backend menormalisasi ke UTC.
- Mata uang berupa objek amount + currency; jangan kirim angka format lokal ke service.
- List memakai page, pageSize, sort, filter; batas maksimum pageSize 100.
- Semua mutasi membutuhkan autentikasi dan pemeriksaan izin kecuali endpoint publik yang dinyatakan.
- Mutasi sensitif menerima idempotency key atau memiliki perlindungan duplikasi.
- Response sukses memakai DTO; error memakai code, message, details aman, requestId.
- Status 400/401/403/404/409/422/429/500 digunakan konsisten.
- Jangan mengembalikan model Prisma mentah ke frontend.

### Create booking request (contoh)

    {
      "buildingId": "uuid",
      "bookingType": "INTERNAL",
      "startsAt": "2026-11-04T09:00:00+07:00",
      "endsAt": "2026-11-04T12:00:00+07:00",
      "eventName": "Seminar",
      "eventDescription": "Deskripsi singkat",
      "attendeeCount": 40
    }

Backend menetapkan requesterId dari session, bukan body. Validasi jam, kapasitas, tipe pemohon, status gedung dan persyaratan di server.

## 5. Jejak kebutuhan ke implementasi

| PRD                    | UI                                   | API/service                          | Data utama                                      |
| ---------------------- | ------------------------------------ | ------------------------------------ | ----------------------------------------------- |
| FR-01 Katalog          | /gedung, detail gedung, admin gedung | GET buildings; admin buildings/rates | Building, Facility, BuildingRate                |
| FR-02 Kalender         | /jadwal, kalender detail             | GET availability                     | Booking, BuildingBlock                          |
| FR-03 Pengajuan        | wizard                               | POST bookings, submit                | Booking                                         |
| FR-04 Bentrok          | pemilih slot dan pesan conflict      | AvailabilityService, BookingService  | Booking, BuildingBlock, DB constraint           |
| FR-05 Persetujuan      | antrean dan review detail            | decision endpoint, ApprovalService   | ApprovalHistory, BookingStatusHistory           |
| FR-06 Status pemohon   | daftar/detail/timeline               | GET bookings                         | Booking, history                                |
| FR-07 Tarif/pembayaran | ringkasan biaya, verifikasi admin    | create payment, verify payment       | BuildingRate, Payment                           |
| FR-08 Handover         | halaman tugas petugas                | handover, complete                   | UsageHandover                                   |
| FR-09 Data gedung      | admin gedung/kalender                | admin CRUD, blocks, rates            | Building, Facility, BuildingRate, BuildingBlock |
| FR-10 AI               | assistant panel                      | POST assistant dan read tools        | katalog/tarif/jadwal                            |
| FR-11 Akses/audit      | UI sesuai capability                 | auth/policy/audit                    | User, Role, AuditEvent                          |
| FR-12 Notifikasi       | inbox status                         | notifikasi in-app                    | Notification                                    |

## 6. Kebutuhan nonfungsional awal

Angka berikut adalah target awal proyek, bukan komitmen layanan yang telah disahkan:

- Kinerja: P95 GET katalog/availability di bawah 2.5 detik pada data uji yang disepakati; mutasi P95 di bawah 3 detik, di luar layanan eksternal.
- Ketersediaan produksi: target 99.5% per bulan bila hosting dan pemantauan mendukung.
- Backup: minimal harian dengan target RPO 24 jam dan RTO 8 jam sebagai sasaran awal.
- Aksesibilitas: WCAG 2.2 AA untuk alur inti sebagai target.
- Keamanan: kontrol akses server, session cookie aman, validasi input, rate limit endpoint sensitif, secret server-only, dan review OWASP dasar sebelum rilis.
- Kompatibilitas: versi terkini dan satu versi sebelumnya untuk browser utama yang dipilih; perangkat seluler Android/iOS melalui browser.
- Privasi: minimisasi data; usulan retensi audit 1 tahun dan lampiran 90 hari setelah booking selesai, tetapi nilai final harus mengikuti aturan Polinela.
- Observability: error, konflik jadwal, provider AI, backup, dan kegagalan notifikasi dimonitor tanpa mencatat data pribadi yang tidak perlu.

Target perlu disesuaikan kapasitas hosting, anggaran dan kebijakan institusi sebelum rilis.

## 7. Rencana verifikasi sebelum produksi

Uji skenario: alur internal berhasil; rental disetujui, pembayaran diverifikasi, lalu confirmed; pembayaran kedaluwarsa melepas slot; dua approval bersamaan untuk slot sama hanya satu berhasil; pengguna tidak dapat membaca booking orang lain; approver hanya memutuskan item tugasnya; petugas hanya mengubah handover; AI memberi tarif/jadwal dari data server dan tidak punya aksi mutasi; kegagalan Gemini tidak menghalangi booking; kalender publik tidak membocorkan data pemohon.

## 8. Daftar keputusan dan pemilik

| ID   | Keputusan terbuka                       | Pemilik keputusan          | Default teknis sementara                                    | Dampak jika belum diputuskan              |
| ---- | --------------------------------------- | -------------------------- | ----------------------------------------------------------- | ----------------------------------------- |
| D-01 | SSO/akun internal dan verifikasi publik | Tim TI/pemilik identitas   | Internal via akun terverifikasi; publik email terverifikasi | Auth dan role tidak dapat dirilis         |
| D-02 | Urutan proses, delegasi dan pengecualian gedung | Subbagian/pimpinan terkait | Mahasiswa tanpa approval WD III di sistem (keputusan pengguna); dosen/teknisi → pemeriksaan awal Bagian Umum/Subbagian Rumah Tangga (proposal); pengelolaan sewa publik melalui aset BLU (proposal). Approver final untuk dosen/pegawai dan sewa publik belum ditetapkan. | Workflow dan assignment produksi belum dapat difinalkan |
| D-03 | Slot hold serta tenggat pembayaran      | Pengelola gedung/BLU       | Hold sejak AWAITING_PAYMENT, tenggat configurable           | Konflik kalender dan status sewa          |
| D-04 | Jam buka, buffer, durasi dan kapasitas  | Pengelola gedung           | Aturan configurable per gedung                              | Validasi booking belum final              |
| D-05 | Tarif/unit/komponen biaya               | BLU/pengelola tarif        | Effective-dated rate per audience dan building              | Tagihan tidak dapat ditetapkan            |
| D-06 | Metode dan verifikasi pembayaran        | Keuangan/BLU               | Pencatatan manual oleh verifier                             | Rental tidak dapat dikonfirmasi           |
| D-07 | Field wajib dan detail berkas mahasiswa   | Pemilik proses/TI/arsip     | Baseline proyek: satu PDF maksimal 5 MB, privat, retensi usulan 90 hari setelah status terminal; belum menjadi kebijakan institusi | Upload nyata dan penghapusan otomatis tetap nonaktif sampai sign-off |
| D-08 | Pembatalan, refund dan no-show          | Pemilik proses/BLU         | Manual review, tidak ada refund otomatis                    | Status dan jadwal perlu penanganan manual |
| D-09 | Hosting, domain, origin dan backup      | Tim TI/proyek              | Reverse proxy same-origin, backup harian                    | Session/CORS dan operasi produksi         |
| D-10 | Brand UI resmi                          | Humas/Polinela             | Token sementara pada style guide                            | Visual final belum disetujui              |
| D-11 | Validitas hasil survei                  | Tim proyek/pembimbing      | Verifikasi kuesioner sumber                                 | Bukti kebutuhan publik terbatas           |

Keputusan yang mengubah uang, persetujuan, identitas, retensi atau kebijakan penggunaan tidak boleh dianggap ditetapkan oleh tim developer.

## 9. Catatan pemeriksaan ringkasan survei

Pemeriksaan proposal `VenueConnect Polinela11 (1) (1) (1) FIX.docx` yang diberikan pengguna dan salinan PDF workspace menemukan ringkasan kuesioner 45 mahasiswa dan 13 responden masyarakat umum. Proposal FIX juga melaporkan wawancara dengan Kepala Subbagian Umum. Persentase ringkasan konsisten secara aritmetika dengan jumlah responden setelah pembulatan satu desimal:

| Kelompok | Klaim ringkasan | Hitungan yang cocok |
| --- | --- | --- |
| Mahasiswa (n=45) | 64,4%; 84,4%; 37,8%; 24,4% | 29/45; 38/45; 17/45; 11/45 |
| Masyarakat umum (n=13) | 92,3%; 84,6%; 92,3% | 12/13; 11/13; 12/13 |

Dua workbook jawaban dari pengguna kini telah diperiksa langsung; metode, hitungan, dan temuan ada di `docs/14-validasi-survei-sumber.md`. Angka ringkasan cocok jika denominator seluruh sampel digunakan. Pada pertanyaan bentrok mahasiswa, satu respons kosong sehingga 38/44 jawaban valid = 86,4%; frasa pertanyaannya adalah “mengalami atau mengetahui”. Sebanyak 16 dari 19 mahasiswa yang menjawab belum pernah menggunakan/mengajukan gedung tetap memilih frekuensi penggunaan selain “Tidak Pernah”. Satu jawaban masyarakat tentang manfaat website hanya berbunyi “Sangat” dan tidak dapat dikodekan tanpa interpretasi. Notulen wawancara dan walkthrough alur operasional tetap belum tersedia.

## 9a. Lingkup inventaris gedung dan identitas visual

Pengguna mula-mula menetapkan empat gedung berikut untuk peminjaman internal dan memberikan alamatnya. Pada 13 Oktober 2026 pengguna menambahkan ruang/gedung pada tabel tarif untuk penyewaan luar kampus; GSG disetujui untuk kedua alur. Rincian 15 entri dan 18 opsi harga ada di `docs/15-inventaris-peminjaman-penyewaan.md`.

| Gedung | Alamat dari pengguna |
| --- | --- |
| Gedung CB | Jl. Soekarno - Hatta No.10, Rajabasa Raya, Kec. Rajabasa, Kota Bandar Lampung, Lampung 35141 |
| Gedung QB | J6RJ+XVH, Hajimena, Kec. Natar, Kabupaten Lampung Selatan, Lampung 35143 |
| Gedung Sakura | J6VJ+FW5, Hajimena, Kec. Natar, Kabupaten Lampung Selatan, Lampung 35143 |
| Gedung GSG | J6VJ+7RG, Hajimena, Kec. Natar, Kabupaten Lampung Selatan, Lampung 35143 |

Alamat ini adalah masukan pengguna, belum verifikasi lokasi atau izin publikasi dari pemilik data gedung. Alamat ruang sewa tambahan tetap kosong karena belum diberikan. Pengguna juga memberikan PNG lambang Politeknik Negeri Lampung (300 × 287 px, transparan) untuk pratinjau UI. Hak publikasi logo, alamat/detail per ruang, serta pemetaan final layanan SK tarif BLU ke inventaris fisik masih perlu dikonfirmasi pemilik data sebelum produksi.

Pengguna kemudian memberikan gambar Gedung GSG untuk pratinjau (`frontend/public/images/gedung-gsg.png`). Berkas asli dipertahankan; tampilan katalog/detail memotong bagian header dan footer melalui CSS agar foto gedung menjadi fokus. Foto Gedung CB, QB, dan Sakura belum tersedia dan akan diberikan kemudian. Sumber/izin publikasi resmi foto GSG tetap perlu dikonfirmasi sebelum produksi.

## 10. Retensi percakapan AI

> **[SEMENTARA — MENUNGGU REVIEW PRIVASI]** Aplikasi tidak menyimpan percakapan assistant ke database atau browser storage; pesan hanya berada di state halaman selama halaman terbuka. Kebijakan retensi/logging pada provider AI, metrik yang boleh dicatat, dan pemberitahuan final kepada pengguna harus ditinjau pemilik privasi sebelum fitur AI diaktifkan untuk produksi.

## 11. Baseline analisis dan desain

Draft kebutuhan, batas MVP, ukuran keberhasilan awal, dan kriteria penerimaan berada di `docs/10-baseline-kebutuhan-mvp.md`. Diagram use case, activity, flowchart, ERD konseptual, dan class diagram yang mengikuti baseline proyek berada di `docs/06-system-diagrams.md`. Proposal FIX melaporkan wawancara dan kuesioner, tetapi tidak melampirkan bukti rinci; walkthrough dengan pemilik proses dan uji prototipe bersama calon pengguna perlu dicatat di `docs/11-validasi-alur-prototipe.md` sebelum pekerjaan validasi ditandai selesai.
