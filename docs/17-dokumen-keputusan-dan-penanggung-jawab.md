# Register dokumen keputusan dan penanggung jawab VenueConnect

Status 13 Oktober 2026. Register ini mencatat **delapan jenis dokumen dan unit penanggung jawab yang disebut pengguna**. Penyebutan unit adalah arah tindak lanjut, bukan bukti penunjukan personel, persetujuan isi, atau tanda tangan institusi. Baseline development boleh dipakai untuk pratinjau; transaksi produksi tetap nonaktif.

## Delapan dokumen yang perlu dihimpun

| Kode | Dokumen/keputusan | Unit yang disebut pengguna | Status bukti di workspace | Hal yang perlu dibuktikan sebelum dipakai untuk produksi |
| --- | --- | --- | --- | --- |
| D1 | Ketentuan autentikasi dan SSO | Subbagian Rumah Tangga / pengelola sistem informasi | **Belum diterima.** Akun demo dan `x-user-id` hanya untuk development. | Metode identitas internal/publik, verifikasi akun, sesi, pemilik role, hak per gedung, konfigurasi origin/cookie/CORS/CSRF, dan akun uji yang disetujui. |
| D2 | SOP alur persetujuan peminjaman gedung | Subbagian Rumah Tangga | **Belum diterima.** Alur tanpa approval WD III merupakan keputusan pengguna untuk baseline sistem, bukan SOP institusi. | Urutan pemeriksaan, jabatan/aktor, assignment dan delegasi, pengecualian gedung, tindak lanjut mahasiswa, pembatalan, dan walkthrough dengan pengelola/pemohon. Alur sewa luar kampus juga perlu konfirmasi pihak terkait BLU. |
| D3 | Ketentuan pembayaran dan tenggat pembayaran | Pengelola BLU Polinela | **Belum diterima.** Transfer manual, bukti privat, dan verifier role tersedia sebagai baseline development, tanpa pengesahan BLU. | Rekening resmi, format/retensi bukti bayar, petugas verifier, tenggat, status gagal/kedaluwarsa, pelepasan slot, refund, dan kebutuhan gateway. Jangan menampilkan rekening atau menagih transaksi nyata sebelum ditetapkan. |
| D4 | Kebijakan retensi berkas dan data peminjam | Pengelola administrasi / pejabat berwenang | **Belum diterima.** Usulan retensi berkas 90 hari setelah status terminal belum disahkan. | Masa simpan, dasar arsip, cakupan booking/dokumen/audit/notifikasi/chat AI, akses, penghapusan, dan hubungan dengan backup. Tidak ada penghapusan otomatis production yang dapat dijadwalkan tanpa keputusan ini. |
| D5 | SK tarif layanan BLU tahun 2026 | Pengelola BLU | **PDF SK diterima sebelumnya:** Keputusan Direktur Polinela No. 1185/PL15/KPTS/2026, ditetapkan 21 Agustus 2026. Pemeriksaan visual 18 opsi tarif luar kampus terhadap halaman 2–3 dicatat di `15-inventaris-peminjaman-penyewaan.md`. | BLU masih perlu mengonfirmasi pemetaan baris tarif ke ruang fisik, kategori/syarat/komponen, dan data yang boleh dipublikasikan. **Keberadaan SK serta kecocokan nominal tidak sama dengan persetujuan publikasi portal atau signoff implementasi.** |
| D6 | Persetujuan konten informasi publik | Humas / pengelola layanan | **Belum diterima.** Logo, foto GSG, alamat, gedung, dan tarif berada pada pratinjau development. | Izin dan versi resmi logo/foto, nama/alamat/fasilitas/kapasitas ruang, daftar tarif yang boleh tampil, syarat penggunaan yang disahkan, jadwal publik, sumber prosedur AI, dan pemilik revisi konten. |
| D7 | Ketentuan domain dan hosting | Subbagian Rumah Tangga | **Belum diterima.** Anggaran proposal bukan keputusan vendor/lingkungan. | Domain, hosting, origin, TLS, lingkungan staging, akses pengelola, biaya aktual/API, dukungan, dan pemilik operasi pascaproyek. |
| D8 | SOP backup dan pemulihan data | Subbagian Rumah Tangga / pengelola server | **Belum diterima.** Latihan teknis dump/restore database dan file lokal development berhasil; itu bukan SOP institusi. | Cakupan database serta object storage, jadwal, lokasi dan enkripsi salinan, akses, retensi, pemantauan kegagalan, RPO/RTO, uji restore staging, dan persetujuan cutover. |

Sumber status teknis: `12-verifikasi-integrasi-development.md`, `15-inventaris-peminjaman-penyewaan.md`, dan `SECURITY.md`. Nominal tarif pada D5 berasal dari SK yang diterima; izin publikasi tetap berada pada D6 dan persetujuan pemilik proses/BLU. Foto CB, QB, Sakura serta ruang sewa tambahan, lokasi ruang baru, dan hubungan nama Gedung Q dengan QB belum diverifikasi.

## Pemetaan ke 33 task utama yang masih terbuka

Nomor adalah urutan checkbox pada `VenueConnect_Task_List.md`, bukan nomor baris. Satu dokumen dapat menjadi prasyarat beberapa task; menerima dokumennya belum otomatis menyelesaikan implementasi, validasi, atau UAT.

| No. | Input utama dari register | Bukti lanjutan agar task dapat ditutup |
| --- | --- | --- |
| 10 | D1 | Keputusan identitas, SSO/verifikasi, dan pemilik role yang berlaku. |
| 11 | D4, D6, D8 | Pengesahan timezone, kanal notifikasi, privasi/retensi, backup, dan batas publikasi jadwal. |
| 12 | D7 | Domain/origin/hosting, anggaran API, pemilik operasi dan dukungan yang ditetapkan. |
| 15 | D5 diterima; D6 belum | Verifikasi identitas dan lokasi 15 entri, foto/kapasitas/syarat, izin publikasi logo dan tarif. |
| 16 | D2 | Walkthrough nyata dengan petugas dan perwakilan pemohon; notulen serta selisih dari baseline. |
| 25 | D2, D6 | Sesi review prototipe dengan calon pengguna, temuan, iterasi, dan persetujuan desain. |
| 29 | D1, D7 | Implementasi dan verifikasi sesi, guard, cookie, CORS, dan CSRF pada origin yang disetujui. |
| 30 | D4, D8, D7 | Object storage privat produksi, akses, siklus berkas, backup, dan uji pemulihan. |
| 31 | D7, D8 | Staging, monitoring/alert, jadwal backup, restore terisolasi, serta pemilik tindak lanjut. |
| 40 | D4, D8 | Implementasi retensi/penghapusan booking, dokumen, audit, dan backup sesuai kebijakan. |
| 41 | D1, D2 | Capability dan assignment per gedung pada semua API, diuji dengan akun resmi/uji TI. |
| 43 | D6, D2 | Konten syarat resmi, cakupan per gedung/periode, pemilik pengesah, dan publikasi terkontrol. |
| 45 | D4, D8 | Jadwal penghapusan terminal dan uji negatif di storage privat produksi. |
| 47 | D2 | Routing persetujuan yang disahkan menurut kategori, jabatan, delegasi, dan pengecualian. |
| 51 | D3, D5 | Bukti bayar, tenggat, gagal/expiry/refund, verifier, dan uji transaksi sesuai BLU. |
| 59 | D6 | Syarat resmi yang disahkan benar-benar tampil pada detail gedung. |
| 62 | D1, D2, D4, D8 | Submit produksi setelah sesi, routing, storage, dan kebijakan berkas siap. |
| 64 | D2, D3 | Instruksi pasca-submit dan tindakan pemohon sesuai kategori, pembayaran, dan pembatalan resmi. |
| 65 | D1, D2 | Dasbor serta assignment per capability dan gedung dengan pengguna yang berwenang. |
| 77 | D1, D3, D4 | Sesi produksi dan pemicu notifikasi sesuai kanal/tenggat yang diputuskan. |
| 78 | D1, D2, D3 | Audit state seluruh alur setelah sesi/API final tersedia. |
| 80 | D6 dan UI final | Audit keyboard, fokus, label, kontras, serta perbaikan temuan; dokumen kebijakan sendiri tidak menutup task. |
| 84 | D6; keputusan provider/API tambahan | Prosedur terverifikasi sebagai sumber AI, key proyek, akses, dan uji provider aktif. |
| 85 | D4; penilaian privasi tambahan | Tinjau redaksi teks bebas/PII yang dapat dikirim ke provider. |
| 89 | D7; keputusan anggaran AI tambahan | Limiter bersama dan pagu biaya pada deployment yang dipilih. |
| 90 | D4; ketentuan provider tambahan | Retensi provider, metrik AI, dan pemberitahuan privasi disahkan. |
| 91 | Di luar D1–D8 | Patch dependency upstream atau pengecualian risiko tertulis oleh pemilik rilis; lihat `SECURITY.md`. |
| 96 | D3 | Uji expiry pembayaran, pelepasan slot, dan idempotensi setelah tenggat disahkan. |
| 97 | D6 | Uji kalender publik dan AI terhadap data/fungsi yang disetujui. |
| 98 | D1–D3, D6 untuk alur final | Uji kegagalan notifikasi/provider, mobile, dan aksesibilitas menyeluruh. |
| 99 | D2, D3, D6; peserta UAT | UAT nyata, skenario, bukti, temuan, perbaikan, dan keputusan penerimaan. |
| 100 | D1–D8 | Pengesahan lintas pemilik untuk data, kebijakan, akun, dan konten publik. |
| 102 | D1–D8 dan task teknis/UAT | Keputusan go-live institusi setelah gerbang kebijakan, keamanan, staging, dan UAT terpenuhi. |

**Status gerbang saat register dibuat:** belum ada lingkungan staging, UAT dengan peserta, atau keputusan go-live yang terdokumentasi. Dokumen D1–D4 dan D6–D8 perlu diminta dari unit yang disebut pengguna; setelah diterima, catat nomor/tanggal/versi, pejabat pengesah, cakupan, dan implikasi perubahan implementasi. Jangan mencentang task hanya karena dokumen diterima tanpa memeriksa isi serta bukti penerapannya.
