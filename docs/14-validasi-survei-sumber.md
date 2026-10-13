# Validasi sumber survei kebutuhan VenueConnect

Pemeriksaan: 12 Oktober 2026. Sumber adalah dua workbook jawaban yang diberikan pengguna, masing-masing sheet `Form Responses 1`. Berkas asli tetap di folder Downloads pengguna; repository ini hanya menyimpan agregat, tanpa nama, NPM, timestamp per orang, atau jawaban bebas per responden.

| Sumber | SHA-256 | Respons terisi |
| --- | --- | ---: |
| Survei mahasiswa | `5457C55DEB4753E601B28E9D757D06BFCDE57FAA4E152252EF3917CF136B5EB7` | 45 |
| Survei masyarakat | `CA9003E01DD690125DDEDD868C9B09767A1EB46790276C5CD7CA84B133DD1576` | 13 |

## Rekonsiliasi angka proposal

| Pertanyaan/hasil | Sumber | Proporsi dari seluruh respons | Catatan |
| --- | ---: | ---: | --- |
| Mahasiswa sering kesulitan mengetahui ketersediaan (kolom J, jawaban `Sering`) | 29/45 | 64,4% | Cocok dengan ringkasan proposal. |
| Mahasiswa pernah mengalami **atau mengetahui** bentrok (kolom L, jawaban `Pernah`) | 38/45 | 84,4% | Cocok jika denominator seluruh sampel. Satu respons kosong; di antara 44 jawaban valid, hasilnya 38/44 = 86,4%. Jangan ubah frasa menjadi “pernah mengalami” saja. |
| Kendala: sulit mengetahui gedung tersedia (kolom K) | 17/45 | 37,8% | Cocok terhadap seluruh sampel; 17/44 = 38,6% dari jawaban valid. |
| Kendala: sulit mengetahui jadwal (kolom K) | 11/45 | 24,4% | Cocok terhadap seluruh sampel; 11/44 = 25,0% dari jawaban valid. |
| Masyarakat menilai informasi ketersediaan `Sangat penting` (kolom G) | 12/13 | 92,3% | Cocok. |
| Masyarakat menilai informasi terpusat `Sangat Perlu` (kolom I) | 11/13 | 84,6% | Cocok. Dua lainnya memilih `Perlu`. |
| Masyarakat menyatakan website membantu (kolom J, jawaban bebas) | 12/13 jelas positif | 92,3% | Dua belas jawaban menyebut “ya/iya” atau “membantu”; satu hanya menyebut “Sangat”, sehingga maksudnya ambigu. Kode ini adalah interpretasi analisis, bukan pilihan formulir baku. |

## Kelengkapan dan konsistensi jawaban

- Pada survei mahasiswa, 45 respons tercatat. Kolom kendala, konflik, dan kemudahan proses masing-masing terisi 44; ketiganya kosong pada respons yang sama. Kolom manfaat website terisi 42. Angka ringkasan yang memakai 45 sebagai denominator harus menyebut adanya respons kosong.
- Pada pertanyaan pertama mahasiswa, 19 orang menjawab belum pernah menggunakan **atau mengajukan** gedung. Dari kelompok itu, 16 tetap memilih frekuensi penggunaan `Jarang`, `Sering`, atau `Sangat Sering` pada pertanyaan berikutnya. Jawaban tersebut tidak konsisten secara literal; jangan menggunakannya untuk menyimpulkan frekuensi pemakaian tanpa klarifikasi responden.
- Seluruh 13 respons masyarakat menjawab belum pernah menggunakan/menyewa gedung Polinela. Lima entri nama kosong, sehingga 13 baris tidak dapat dibuktikan sebagai 13 individu unik dari identitas di workbook. Kolom preferensi kanal informasi menunjukkan 6 memilih telepon/WhatsApp, 3 media sosial, 3 website, dan 1 datang langsung. Ini adalah preferensi sampel kecil, bukan keputusan kanal layanan resmi.
- File mengandung nama dan NPM. Jangan menyalin berkas asli ke repository, memasukkan identitas ke dokumentasi, atau memakai jawaban bebas sebagai prompt AI tanpa redaksi dan kebijakan privasi.

## Implikasi proyek

Survei mendukung kebutuhan melihat ketersediaan dan informasi gedung secara terpusat, tetapi tidak menetapkan tarif, alur persetujuan, identitas akun, atau kebijakan operasional. Untuk laporan, gunakan denominator dan kata-kata pertanyaan asli; jelaskan kekosongan serta inkonsistensi di atas. Walkthrough dengan pengelola dan calon pengguna tetap diperlukan untuk memvalidasi proses nyata.
