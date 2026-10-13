# Skenario UAT VenueConnect Polinela

> Draft persiapan UAT. Dokumen ini bukan bukti UAT dan bukan pengesahan kebijakan. Jangan memakai data pribadi atau transaksi nyata.

Integrasi API pada PostgreSQL development lokal, termasuk lewat proxy frontend, telah dijalankan pada 12 Oktober 2026. Bukti teknis dan batasnya dicatat di `docs/12-verifikasi-integrasi-development.md`. Semua status dalam tabel di bawah tetap merujuk pada **sesi UAT dengan peserta**, yang belum dilaksanakan; keberhasilan uji development tidak dihitung sebagai kelulusan UAT.

## Prasyarat

- Pemilik proses menyetujui alur mahasiswa, dosen/pegawai, rental publik, status, pembatalan, pembayaran, tenggat, dan petugas.
- Staging memakai database dan file uji yang terisolasi; bukan data produksi.
- Autentikasi, capability, assignment approver/verifier/petugas, storage privat, backup, dan logging sudah dikonfigurasi.
- Siapkan akun uji per role, gedung/tarif dummy yang disahkan untuk UAT, dan jadwal uji yang tidak menimpa data operasional.
- Catat browser/perangkat, versi aplikasi, tanggal, peserta, dan pemilik proses yang menyaksikan hasil.

## Skenario

| ID | Peran | Langkah inti | Hasil yang diharapkan | Status |
| --- | --- | --- | --- | --- |
| PUB-01 | Pengunjung | Cari gedung dengan nama, lokasi, fasilitas, dan kapasitas; buka detail dan kalender. | Hasil filter tepat; tarif hanya sesuai audience publik; kalender menampilkan rentang/status umum tanpa identitas atau nama acara. | Belum diuji |
| PUB-02 | Pengunjung | Buka detail gedung yang belum memiliki syarat resmi. | UI menyatakan syarat belum tersedia dan tidak menyajikan placeholder seolah-olah kebijakan resmi. | Belum diuji |
| STU-01 | Mahasiswa | Buka wizard mahasiswa, pilih PDF uji, kirim pengajuan, dan periksa status. | Satu PDF maksimal 5 MB tersimpan privat pada development, pengajuan menjadi `SUBMITTED`, dan tidak ada approval WD III. | Belum diuji dalam UAT; alur development lulus |
| STU-02 | Pengelola | Tinjau berkas mahasiswa, minta revisi, buka berkas pengganti, dan putuskan. | Berkas hanya dapat diakses pemohon/pengelola yang berwenang; keputusan dan catatan mengikuti SOP yang disahkan. | Terblokir untuk UAT resmi: SOP/assignment belum disahkan; alur development lulus |
| STAFF-01 | Dosen/pegawai | Ajukan booking dan ikuti routing yang disahkan. | Hanya approver yang ditugaskan dapat memutuskan; pemohon melihat riwayat dan notifikasi. | Terblokir untuk UAT resmi: autentikasi dan assignment jabatan belum disahkan; routing generik development lulus |
| EXT-01 | Penyewa umum | Ajukan rental, tinjau tarif snapshot, lalu ikuti instruksi pembayaran. | Tarif sesuai keputusan; booking menahan slot hanya sesuai hold/tenggat resmi; instruksi dan expiry benar. | Terblokir untuk UAT resmi: tarif terpetakan, tenggat, bukti pembayaran, dan instruksi BLU belum disahkan; alur dasar development lulus |
| CON-01 | Dua pemohon | Kirim permintaan atau approval bersamaan untuk gedung dan rentang yang sama. | Maksimal satu transaksi memperoleh slot yang mengunci; transaksi lain menerima konflik yang aman. | Belum diuji dalam UAT; konkurensi PostgreSQL development lulus |
| AUTH-01 | Dua pemohon dan tiap role | Coba baca detail booking silang, keputusan tanpa assignment, verifikasi tanpa role, dan akses dokumen tanpa izin. | Request ditolak atau disamarkan sesuai kebijakan; tidak ada kebocoran data melalui pesan/error/log. | Terblokir untuk UAT resmi: sesi dan assignment production belum tersedia; guard development sebagian lulus |
| PAY-01 | Verifier | Verifikasi nominal/mata uang yang sama dan yang berbeda dari snapshot tarif. | Yang cocok dapat diproses; mismatch tetap pending dan tidak mengonfirmasi booking. | Belum diuji dengan data uji |
| PAY-02 | Operator | Biarkan pembayaran uji melewati tenggat yang telah disahkan. | Booking menjadi expired secara idempotent dan slot dilepas; pemohon menerima notifikasi. | Terblokir: expiry job/tenggat |
| OPS-01 | Petugas | Catat serah-terima, pengembalian, dan penyelesaian penggunaan. | Setiap transisi hanya terjadi sekali, memiliki aktor/waktu/audit, dan memberi notifikasi yang tepat. | Belum diuji dalam UAT; alur akun uji development lulus, assignment petugas belum tersedia |
| AI-01 | Pengunjung | Tanyakan gedung/fasilitas/tarif/ketersediaan lalu coba masukkan PII uji sintetis. | Jawaban hanya bersumber dari tool baca-saja; input PII ditolak; assistant tidak mengubah transaksi. | Belum diuji di staging |
| FAIL-01 | Penguji | Nonaktifkan provider AI dan buat simulasi error/rate-limit/notifikasi. | Fitur booking/katalog tetap dapat dipakai; AI memberi fallback; kegagalan notifikasi tidak membatalkan transaksi. | Belum diuji di staging |
| A11Y-01 | Pengguna keyboard/screen reader | Jalankan alur pencarian, kalender, wizard, inbox, dan panel sesuai role. | Label/nama kontrol jelas, fokus terlihat, urutan keyboard logis, status tidak hanya memakai warna, kontras memenuhi target yang disetujui. | Belum diuji dengan pengguna |
| MOB-01 | Pengguna ponsel | Jalankan skenario PUB-01, wizard, inbox, dan tindakan operator pada viewport ponsel. | Konten dan kontrol dapat digunakan tanpa kehilangan fungsi atau scroll horizontal yang tidak perlu. | Belum diuji dengan pengguna |

## Catatan pelaksanaan per sesi

Salin tabel berikut untuk setiap sesi; isi bukti dengan screenshot yang tidak menampilkan PII, request ID sintetis, atau log yang sudah disanitasi.

| ID skenario | Peserta/role | Tanggal & perangkat | Hasil (lulus/gagal/terblokir) | Bukti | Temuan & tingkat dampak | Tindak lanjut/pemilik |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |

## Kriteria penutupan

- Semua skenario inti berstatus lulus atau memiliki pengecualian tertulis dari pemilik proses.
- Setiap temuan memiliki dampak, pemilik, target perbaikan, dan bukti retest.
- Skenario yang berstatus terblokir tidak dihitung lulus dan tidak menjadi dasar rilis.
- Pemilik proses menandatangani hasil UAT dan checklist rilis setelah melihat bukti.
