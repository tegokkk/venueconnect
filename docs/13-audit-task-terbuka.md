# Audit task terbuka VenueConnect

Tanggal audit: 13 Oktober 2026. Sumber hitung: 102 checkbox berurutan di `VenueConnect_Task_List.md`; **70 selesai, 32 terbuka (68,6%)**. Nomor di bawah adalah urutan checkbox, bukan nomor baris berkas. Rincian progres implementasi ada pada checklist; dokumen ini menetapkan tindak lanjut untuk **setiap** checkbox terbuka.

Keputusan pengguna yang berlaku: baseline proyek boleh dipakai untuk development, tetapi produksi tetap nonaktif sampai keputusan dan validasi resmi lengkap. Pengguna telah memberikan dua workbook survei, PNG logo, empat nama gedung, alamat masing-masing, dan gambar GSG; analisis, alamat, dan aset pratinjau tercatat terpisah. Foto CB/QB/Sakura menyusul. Delapan jenis dokumen dan unit yang disebut pengguna kini dipetakan pada `17-dokumen-keputusan-dan-penanggung-jawab.md`: SK tarif sudah diterima, tujuh dokumen lainnya belum. Tidak ada persetujuan publikasi institusi, UAT, akun operasional, atau infrastruktur yang boleh diasumsikan dari prototipe.

| No. | Tindak lanjut yang diperlukan | Bukti/keputusan yang masih diperlukan |
| --- | --- | --- |
| 10 | Tetapkan autentikasi internal dan publik, verifikasi, SSO, serta pengelola role; baru implementasikan sesi produksi. | Keputusan TI/pemilik proses dan metode identitas yang disetujui. |
| 11 | Sahkan timezone, kanal notifikasi, privasi dan retensi, backup, serta batas publikasi jadwal. | Kebijakan tertulis TI/pemilik data. `Asia/Jakarta` masih nilai pratinjau. |
| 12 | Pilih domain, hosting, origin, anggaran API, pemilik operasi, dan dukungan. | Keputusan pengadaan dan penanggung jawab. Angka proposal bukan biaya aktual. |
| 15 | Verifikasi publikasi logo/foto/alamat/detail empat gedung pinjam dan sebelas ruang sewa tambahan serta tarif BLU. | Seluruh 18 nominal/satuan cocok dengan SK 1185/PL15/KPTS/2026; seed development menyimpan awal berlaku 21 Agustus 2026 sesuai SK. Masih perlu persetujuan Humas/pemilik data dan BLU, verifikasi alamat/foto ruang baru, identitas ruang fisik, hubungan Gedung Q dengan QB, kapasitas rentang, serta syarat. Lihat `docs/15-inventaris-peminjaman-penyewaan.md`. |
| 16 | Lakukan walkthrough proses manual dan catat perbedaan dengan baseline. | Notulen/konfirmasi pengelola, petugas, serta perwakilan pemohon. |
| 25 | Jalankan review prototipe, catat temuan, iterasi, dan persetujuan desain. | Sesi nyata dan lembar temuan calon pengguna. |
| 29 | Bangun sesi, guard, cookie, CORS, dan CSRF sesuai pilihan autentikasi/deployment. | Keputusan #10 dan #12; akun/SSO uji dari TI. |
| 30 | Pindahkan lampiran ke object storage privat produksi dan uji lifecycle/backup. | PDF mahasiswa dan bukti pembayaran sudah memakai storage privat lokal; snapshot/restore keduanya lulus. Pilihan object storage produksi, kredensial terkelola, serta retensi #11/#40 tetap diperlukan. |
| 31 | Siapkan staging, observabilitas, backup terjadwal, dan uji restore terisolasi. | Latihan dump/restore database dan snapshot/restore PDF mahasiswa serta bukti pembayaran development dengan checksum berhasil 13 Oktober; pemeriksaan health lokal juga lulus. Masih perlu staging, domain/origin, pemantauan/alert, owner operasi, jadwal/enkripsi/salinan off-site, dan target RPO/RTO. |
| 40 | Terapkan retensi dan penghapusan untuk booking, dokumen, audit, serta backup. | Latihan pemulihan teknis tidak menetapkan masa simpan; dasar arsip dan prosedur penghapusan tetap perlu disahkan. |
| 41 | Lengkapi autentikasi dan capability/assignment per gedung pada semua API. | Guard assignment user/role approval dan pemeriksaan ulang slot/kelayakan gedung setelah lock diperketat. #10, capability per gedung, matriks assignment, dan pemilik kewenangan resmi masih diperlukan. |
| 43 | Isi syarat resmi dan tetapkan cakupan berlaku per gedung/periode. | Admin development sudah dapat mengelola draf privat, referensi pengesahan, dan terbit eksplisit; konten resmi dan pemilik pengesah belum tersedia. |
| 45 | Jadwalkan penghapusan berkas terminal serta storage privat produksi. | #30 dan #40; uji negatif setelah integrasi. |
| 47 | Kunci routing persetujuan per kategori, jabatan, delegasi, dan pengecualian. | Assignment institusi yang disahkan dan hasil walkthrough #16. |
| 51 | Lengkapi bukti bayar, tenggat, kegagalan, kedaluwarsa, dan refund; uji transaksi. | Bukti privat PDF/JPEG/PNG, kontrol akses, metadata, UI, dan integrasi development lulus. Kebijakan/rekening/verifier resmi BLU, tenggat, expiry/pelepasan slot, refund, dan keputusan gateway bila ada tetap diperlukan. |
| 59 | Tampilkan syarat resmi pada detail gedung. | Komponen publik sudah siap dan hanya membaca syarat yang terbit; menunggu konten disahkan dari #43. |
| 62 | Aktifkan submit booking produksi setelah kontrol akses, routing, dan storage siap. | #29, #30, #47, kebijakan dokumen, dan verifikasi integrasi. |
| 64 | Tampilkan langkah pasca-submit dan tindakan sesuai kategori yang disahkan. | Hasil #16/#47 dan kebijakan pembatalan/pembayaran. |
| 65 | Lengkapi dashboard per capability dan penugasan gedung. | #10/#41 serta matriks petugas operasional. |
| 77 | Aktifkan sesi produksi dan pemicu notifikasi sisa, termasuk expiry bila disahkan. | #29/#51 serta aturan kanal dan waktu #11. |
| 78 | Audit state loading, kosong, error, sesi habis, konflik, sukses, dan data berubah di semua alur. | Sesi produksi, API final, dan skenario uji lengkap. |
| 80 | Audit keyboard, fokus, label, kontras, dan status seluruh alur lalu perbaiki temuan. | UI/API final dan pemeriksaan aksesibilitas terstruktur. |
| 84 | Hubungkan fungsi prosedur ke sumber resmi dan uji AI dengan provider aktif. | Prosedur terverifikasi, key proyek, dan batas akses/biaya. |
| 85 | Tinjau redaksi teks bebas dan kebijakan data sebelum mengirim ke model. | Guard menolak tambahan data pribadi berlabel dan email dengan karakter zero-width; unit test lulus. Penilaian privasi/retensi dan cakupan PII yang disetujui tetap diperlukan. |
| 89 | Terapkan limiter bersama serta pagu biaya AI pada deployment. | Batas global per proses sudah mengurangi bypass lewat header IP palsu pada development; limiter bersama lintas instance, provider/deployment, dan anggaran operasi resmi masih diperlukan. |
| 90 | Tetapkan retensi provider, metrik AI, dan pemberitahuan privasi. | Keputusan TI/pemilik data dan kontrak penyedia. |
| 91 | Perbarui rantai lint dependency ketika patch ada atau putuskan pengecualian risiko. | Patch upstream atau penerimaan risiko rilis; lihat `SECURITY.md`. |
| 97 | Uji kalender publik dan jawaban AI terhadap data/fungsi yang disetujui. | Sumber prosedur, key/provider, dan data publik final. |
| 98 | Uji error dan kegagalan notifikasi/AI, mobile, serta aksesibilitas alur inti. | Smoke 390 px kini mencakup wizard dan halaman publik; audit fokus/validasi wizard parsial ada di `16-audit-frontend-2026-10-13.md`. Lingkungan integrasi, kegagalan provider nyata, alur transaksi mobile lengkap, dan audit aksesibilitas formal masih diperlukan. |
| 99 | Jalankan UAT, simpan bukti, temuan, perbaikan, dan persetujuan. | Peserta dan pemilik proses; gunakan `08-skenario-uat.md`. |
| 100 | Sahkan data gedung/tarif, kebijakan, akun, dan konten publik. | Tanda tangan/keputusan pemilik institusi, BLU, dan TI. |
| 102 | Rilis setelah seluruh gerbang kebijakan, keamanan, UAT, dan operasional terpenuhi. | #10–#100 yang relevan selesai serta keputusan go-live institusi. |

## Urutan eksekusi lanjutan

1. Verifikasi alamat yang diberikan pengguna, kumpulkan foto tiga gedung pinjam lainnya dan ruang sewa baru, detail serta izin publikasi 15 entri katalog, pemetaan tarif BLU dan identitas ruang fisik, serta daftar pemilik keputusan. Dua workbook survei, PNG logo, gambar GSG, dan cuplikan tarif pengguna sudah dipakai untuk pratinjau.
2. Validasi proses/prototipe dengan pihak yang disebut pada #16 dan #25. Tetapkan kebijakan akun, lampiran, pembayaran, retensi, jadwal, dan hosting secara tertulis.
3. Terapkan kontrol produksi (#29–#65), lalu selesaikan audit state/aksesibilitas dan AI sesuai kebijakan. Jalankan uji integrasi serta restore pada staging.
4. Laksanakan UAT, sahkan data/konten, dan minta keputusan rilis. Sampai itu terjadi, gunakan implementasi ini hanya sebagai development preview.
