# Audit frontend development — 13 Oktober 2026

Dokumen ini mencatat perbaikan dan pemeriksaan lokal untuk task list utama terkait kondisi gagal (#103), aksesibilitas (#105), serta perangkat mobile dan kegagalan alur (#129). Ini bukan hasil UAT atau audit aksesibilitas formal.

## Perbaikan

- Layout akar mempertahankan satu landmark `main` dengan target tautan “Lewati ke konten utama”. `main` yang bersarang pada layout anggota/operator dan halaman detail, jadwal, pengajuan, notifikasi, error, serta 404 diganti dengan `div`.
- Rute publik utama diberi judul dokumen tersendiri; judul detail gedung dan wizard memuat nama gedung dari katalog agar perpindahan rute dapat diumumkan lebih jelas oleh pembaca layar.
- Wizard pengajuan memindahkan fokus ke judul langkah setelah navigasi internal, ke input berkas ketika mahasiswa melanjutkan tanpa PDF, dan ke field pertama yang tidak valid pada rincian kegiatan. Kesalahan API 401, 403, 409, 410, dan 429 mendapat pesan kontekstual. Ringkasan pengajuan membungkus teks panjang pada layar sempit.
- Jika permintaan asisten gagal atau respons jawaban kosong, panel mempertahankan pertanyaan yang gagal untuk percobaan ulang tanpa menduplikasi pesan pengguna, serta menyediakan tautan ke katalog dan jadwal.
- Kalender ketersediaan FullCalendar di `/jadwal` dan `/gedung/[slug]` dipertegas dengan legenda 3 status eksplisit: Hijau (`bg-emerald-600 ring-2 ring-emerald-200`) untuk Tersedia/Waktu buka, Abu-abu slate (`#64748b`) untuk Sudah dipesan, dan Abu-abu gelap (`#1e293b`) untuk Diblokir/Pemeliharaan, dengan kontras teks putih.
- Antrean operator di `/admin` kini mendukung pencarian teks (no. referensi, nama gedung, nama kegiatan), filter kategori pemohon (`MAHASISWA`, `DOSEN_PEGAWAI`, `UMUM`), filter status (termasuk status baru `EXPIRED`), pengurutan (waktu pengajuan dan tanggal pelaksanaan), badge kategori visual, dan tata letak responsif ramah layar mobile.
- Aksesibilitas accordion FAQ di `/bantuan` dilengkapi dengan outline fokus terlihat (`focus-visible`) serta ID semantik pada tombol dan panel konten.
- Dialog konfirmasi penyelesaian penggunaan pada `UsagePanel` di `/admin/gedung` menggantikan `window.confirm` bawaan peramban dengan modal dialog semantik (`role="dialog"`, `aria-modal="true"`, `onKeyDown` Escape, dan `focus-visible`).

## Bukti pemeriksaan lokal

- `npx eslint` pada file JavaScript yang diubah: exit code 0 (dua kali pemeriksaan bertarget sebelum guard respons AI kosong terakhir). Pemeriksaan ulang satu file dan `npm run lint` seluruh folder masing-masing tersendat lebih dari 90 detik tanpa keluaran lalu dihentikan. Guard terakhir belum mendapat hasil lint baru; pemeriksaan build final masih diperlukan.
- Parser Babel berhasil membaca 52 file JavaScript di `frontend/src` sesudah perubahan terakhir (exit code 0); ini membuktikan sintaks JSX valid, bukan menggantikan lint/build.
- Build produksi frontend `npm run build` lulus tanpa error (exit code 0).
- HTTP development mengembalikan judul `Katalog gedung | VenueConnect Polinela`, `Gedung GSG | VenueConnect Polinela`, dan `Ajukan Gedung GSG | VenueConnect Polinela` pada ketiga rute terkait.
- Browser development pada `/gedung`: `mainCount=1`, `nestedMain=0`, tanpa overflow horizontal pada viewport awal.
- Browser development pada `/pinjam/gedung-gsg?purpose=loan`: saat mahasiswa melanjutkan tanpa PDF, fokus pindah ke input berkas; setelah memilih dosen/pegawai dan melanjutkan, fokus pindah ke judul “Detail kegiatan”; saat melanjutkan dengan isian kosong, fokus pindah ke input “Nama kegiatan” dan pesan tiap field ditampilkan.
- Viewport browser 390 × 844 pada wizard: `scrollWidth=375`, `innerWidth=390`, satu landmark `main`, tidak ada overflow horizontal. Pemeriksaan visual menunjukkan form dan pesan kesalahan tetap terbaca pada lebar tersebut.

## Yang belum dapat ditandai selesai

- Audit aksesibilitas otomatis/manual menyeluruh (termasuk pembaca layar, semua dialog, kontras, dan seluruh role) belum dilakukan.
- Mobile smoke baru mencakup wizard dan ringkasan antrean pada perubahan ini; transaksi lengkap sampai penyimpanan, alur operator, dan kegagalan provider AI belum diverifikasi.
- UAT memerlukan peserta dan bukti sesi aktual. Autentikasi produksi, routing final, dan kebijakan yang belum disahkan tetap memblokir verifikasi produksi.
