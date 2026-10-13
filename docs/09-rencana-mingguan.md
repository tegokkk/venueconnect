# Rencana Kerja Mingguan VenueConnect Polinela

> **Draft koordinasi, bukan jadwal yang disahkan.** Disusun 11 Oktober 2026 dari task list saat ini. Nama dan ketersediaan pemilik belum diberikan; kolom pemilik berisi peran yang perlu ditunjuk. Jangan menganggap milestone terjadwal sebagai komitmen sampai product owner, unit terkait, dan tim pelaksana menyetujuinya.

## Rekonsiliasi periode yang telah lewat

Periode 1 September–11 Oktober 2026 sudah berlalu. Workspace tidak menyimpan laporan mingguan, nama pemilik, atau bukti deliverable untuk periode tersebut. Tim perlu mengisi realisasi dan bukti dari catatan proyek sebelum menetapkan status minggu-minggu ini; dokumen ini tidak mengasumsikan pekerjaan yang tidak tercatat.

## Usulan rencana 12 Oktober–31 Desember 2026

| Minggu | Fokus dan hasil kerja | Deliverable yang dapat ditinjau | Pemilik yang perlu ditunjuk | Ketergantungan / gerbang |
| --- | --- | --- | --- | --- |
| 12–18 Okt | Review task list bersama pemilik proses; putuskan batas MVP dan daftar keputusan prioritas | Daftar keputusan dengan opsi, penanggung jawab, dan tenggat; daftar blocker berurutan | Product owner Polinela, koordinator proyek | Kehadiran Subbagian Umum/Rumah Tangga dan unit terkait |
| 19–25 Okt | Sahkan kategori pemohon, alur mahasiswa/dosen/pegawai/penyewa, role/capability, data minimum, dan aturan slot | Alur dan matriks capability yang disetujui; keputusan tarif, pembayaran, dokumen, timezone dicatat | Pemilik proses, admin TI, unit keuangan | Persetujuan pejabat/unit berwenang |
| 26 Okt–1 Nov | Pilih provider autentikasi, origin, hosting, storage, dan pemilik operasional; siapkan environment staging | Keputusan arsitektur dan environment staging terisolasi; inventaris rahasia dan akses | Admin TI/infrastruktur, security owner | Domain, anggaran, kredensial, serta operator ditetapkan |
| 2–8 Nov | Terapkan sesi/capability dan migrasi yang diperlukan; aktifkan storage hanya dengan kebijakan dokumen yang disahkan | Login development/staging, policy akses, migrasi ter-review, penyimpanan privat terkonfigurasi | Backend lead, admin TI | Provider dan aturan akses/retensi sudah disetujui |
| 9–15 Nov | Lengkapi unggah/unduh dokumen, tindak lanjut mahasiswa, dan routing persetujuan terkonfigurasi | Alur dokumen dan approval pada staging dengan audit trail | Backend lead, pemilik proses | Tipe/ukuran/jumlah/retensi dokumen dan assignment tersedia |
| 16–22 Nov | Lengkapi pembuatan/verifikasi/penolakan/expiry pembayaran, notifikasi, handover, dan audit | Skenario transaksi staging dengan status, riwayat, dan notifikasi yang disepakati | Backend lead, verifier, petugas gedung | Metode pembayaran, verifier, tenggat, refund, serta SOP disahkan |
| 23–29 Nov | Integrasikan submit, revisi/pembatalan, dashboard per capability, dan halaman syarat resmi | Alur pemohon/operator terhubung pada staging tanpa data contoh | Frontend lead, backend lead, product owner | API/auth/routing siap; konten publik resmi tersedia |
| 30 Nov–6 Des | Perbaiki aksesibilitas, perangkat mobile, state error/kedaluwarsa, privasi AI, dan dokumentasi bantuan | Hasil audit aksesibilitas, daftar isu dengan prioritas, dokumentasi pemohon/operator draft | Frontend lead, accessibility reviewer, AI owner | Peran reviewer dan sumber prosedur resmi tersedia |
| 7–13 Des | Verifikasi teknis end-to-end, concurrency, ownership/assignment, dependency, backup dan restore | Laporan verifikasi berisi hasil, log aman, versi dependency, dan bukti latihan restore terisolasi | QA lead, security owner, admin TI | Staging dan data uji disiapkan; jadwal backup tersedia |
| 14–20 Des | UAT dengan perwakilan mahasiswa, dosen/pegawai, pengelola, verifier, petugas, dan publik | Skenario, daftar peserta/peran, hasil, bukti yang disetujui, temuan dan keputusan | Koordinator UAT, pemilik proses | Peserta dan persetujuan penggunaan data uji dijadwalkan |
| 21–27 Des | Remediasi temuan UAT/security dan validasi ulang | Daftar temuan tertutup/diterima pemilik, build staging, panduan dukungan dan insiden | Tech lead, QA lead, pemilik tiap temuan | UAT selesai dan keputusan penerimaan risiko tercatat |
| 28–31 Des | Tinjau kesiapan dan putuskan rilis atau lanjut perbaikan | Catatan go/no-go dan daftar syarat yang belum terpenuhi | Sponsor/pemilik proses, admin TI, product owner | Semua sign-off, dukungan, operasi, dan kontrol rilis tersedia |

## Aturan pembaruan

- Ganti peran dengan nama pemilik setelah penunjukan resmi; tambahkan pengganti untuk tanggung jawab operasional.
- Catat tanggal aktual, tautan bukti, status, dan blocker per minggu setelah rapat koordinasi.
- Geser tanggal bila dependensi belum tersedia; jangan menandai UAT, restore, atau rilis selesai tanpa bukti pelaksanaan.
- Jadwal ini tidak menetapkan keputusan proses, tarif, akses, privasi, atau target layanan.
