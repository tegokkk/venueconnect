# Inventaris Peminjaman dan Penyewaan VenueConnect

Keputusan pengguna 13 Oktober 2026 memisahkan dua katalog. **Peminjaman internal Polinela** memakai Gedung CB, Gedung QB, Gedung Sakura, dan Gedung GSG. **Penyewaan luar kampus** memakai GSG serta ruang/layanan yang terlihat pada tabel tarif yang dikirim pengguna. GSG adalah satu gedung yang dapat dipakai pada kedua alur, sehingga kalender dan pemeriksaan bentroknya berbagi ID gedung yang sama.

Sumber daftar dan nominal: [cuplikan tabel tarif pengguna](assets/tarif-penyewaan-2026.png) dan Keputusan Direktur Polinela No. 1185/PL15/KPTS/2026. Pemeriksaan visual pada halaman 2–3 lampiran SK menunjukkan seluruh 18 opsi harga luar kampus di bawah cocok dengan nominal dan satuan sumber. SK ditetapkan pada **21 Agustus 2026** dan diktum KEDUA pada halaman 1 menyatakan keputusan berlaku sejak tanggal ditetapkan. Cuplikan hanya menampilkan baris yang terlihat; baris terpotong tidak ditebak. Angka di bawah adalah data **development/pratinjau**; identitas ruang, syarat penggunaan, dan izin publikasi produksi masih perlu dikonfirmasi BLU/pengelola. Seed menyimpan 21 Agustus 2026 pukul 00.00 WIB sebagai awal berlaku sesuai SK; penetapan tanggal dalam data development tidak mengaktifkan transaksi produksi.

## Peminjaman internal

| Gedung | Alamat | Sewa luar kampus? |
| --- | --- | --- |
| Gedung CB | Jl. Soekarno - Hatta No.10, Rajabasa Raya, Kec. Rajabasa, Kota Bandar Lampung, Lampung 35141 | Tidak pada daftar sewa yang diberikan |
| Gedung QB | J6RJ+XVH, Hajimena, Kec. Natar, Kabupaten Lampung Selatan, Lampung 35143 | Tidak pada daftar sewa yang diberikan |
| Gedung Sakura | J6VJ+FW5, Hajimena, Kec. Natar, Kabupaten Lampung Selatan, Lampung 35143 | Tidak pada daftar sewa yang diberikan |
| Gedung GSG | J6VJ+7RG, Hajimena, Kec. Natar, Kabupaten Lampung Selatan, Lampung 35143 | Ya, gedung yang sama |

Harga sewa luar kampus tidak ditampilkan pada kartu atau detail dalam konteks peminjaman. Peminjaman internal tidak mengambil snapshot tarif sewa.

## Penyewaan luar kampus

| Ruang/gedung dalam katalog | Tarif yang terlihat pada sumber | Status perhitungan di development |
| --- | --- | --- |
| Gedung GSG | Rp10.000.000 per hari maks. 8 jam, termasuk videotron, 300 kursi, sound system; tambahan kursi Rp5.000 per unit maks. 8 jam | Tarif utama tetap dapat dipakai sebagai snapshot; tambahan kursi hanya informasi |
| Smartroom Class | Rp250.000 per jam, minimum 2 jam | Informasi; perkalian jam belum menjadi tagihan otomatis |
| Ruang Kelas Biasa (kapasitas 30–40) | Rp500.000 per 8 jam; Rp2.500.000 per minggu maks. 6 hari; Rp10.000.000 per bulan maks. 24 hari | Informasi; ruang fisik spesifik belum diidentifikasi dan durasi mingguan/bulanan belum dihitung otomatis |
| Ruang Rapat Gedung H (50 orang) | Rp2.500.000 per 8 jam | Tarif tetap dapat dipakai sebagai snapshot |
| Ruang Rapat Gedung Seroja (20 orang) | Rp1.000.000 per 8 jam | Tarif tetap dapat dipakai sebagai snapshot |
| Ruang Rapat Gedung KHD (20 orang) | Rp1.000.000 per 8 jam | Tarif tetap dapat dipakai sebagai snapshot |
| Ruang Rapat Gedung A (20 orang) | Rp1.000.000 per 8 jam | Tarif tetap dapat dipakai sebagai snapshot |
| Ruang Seminar Gedung S (kapasitas 100–150) | Rp3.000.000 per 8 jam | Tarif tetap dapat dipakai sebagai snapshot; kapasitas rentang belum menjadi batas numerik |
| Ruang Seminar Gedung Q (kapasitas 50–100) | Rp2.000.000 per 8 jam | Tarif tetap dapat dipakai sebagai snapshot; hubungan dengan Gedung QB belum diverifikasi |
| Laboratorium Komputer (kapasitas 30–35) | Rp4.000.000 per 8 jam; Rp200.000 per orang, minimum 2 orang | Informasi; ruang fisik spesifik dan hitungan per orang belum ditetapkan |
| Ruang Sidang Utama | Rp3.000.000 per hari; paket full day Rp300.000 per orang maks. 8 jam min. 30 orang; paket half day Rp200.000 per orang maks. 4 jam min. 30 orang | Informasi; perhitungan paket per orang belum menjadi tagihan otomatis |
| Laboratorium Teknologi Hasil Pertanian | Rp2.500.000 per hari maks. 8 jam | Tarif tetap dapat dipakai sebagai snapshot |

**Tambahan kursi adalah komponen GSG, bukan gedung tersendiri.** Rentang kapasitas dibiarkan sebagai keterangan karena satu angka maksimum belum aman dijadikan batas booking. Alamat ruang baru tidak diisi tanpa sumber. Tidak ada foto ruang baru yang diberikan. Status tarif “informasi” berarti terlihat pada katalog/detail, tetapi pengajuan sewa melalui portal belum dapat dikirim untuk ruang itu sampai aturan kuantitas/durasi dan lokasi fisik dikonfirmasi. Tarif tetap di atas dibatasi maksimum 8 jam pada booking development; semua transaksi produksi tetap nonaktif sesuai keputusan proyek.

## Implementasi

- Migration ketujuh menambah `Building.internalLoanEnabled`, `BuildingRate.isBookable`, dan `BuildingRate.maxDurationMinutes`.
- Migration kedelapan menambah referensi pengesahan dan status terbit untuk draf syarat gedung; seed tidak memasukkan teks syarat yang belum diberikan.
- Seed lokal idempoten menghasilkan 15 ruang/gedung aktif: 4 dapat dipinjam, 12 dapat disewa, dengan GSG dihitung pada kedua kategori; total 18 opsi harga `EXTERNAL`.
- Endpoint katalog menerima `purpose=loan|rental`; UI memisahkan daftar dan detail. API booking menolak peminjaman ruang sewa saja dan penyewaan gedung pinjam saja.
- Harga publik hanya `EXTERNAL`. Harga dengan `isBookable=false` tetap tampil sebagai informasi, tanpa dipakai untuk snapshot/tagihan otomatis.

## Data yang masih perlu dikonfirmasi pemilik proses

Identitas dan alamat fisik tiap ruang baru; apakah Ruang Seminar Gedung Q terkait Gedung QB; kapasitas pasti pada rentang; inventaris/foto/fasilitas; durasi dan perhitungan jam, minggu, bulan, per orang serta tambahan kursi; komponen pajak/biaya bila ada; syarat dan izin publikasi produksi.
