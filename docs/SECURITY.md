# Catatan audit keamanan dependency

Pemeriksaan diulang pada 13 Oktober 2026 dengan `npm audit --audit-level=high` dan `npm audit --omit=dev --audit-level=high` pada `backend/` dan `frontend/`. Audit penuh masing-masing tetap melaporkan lima entri `high` pada satu rantai dependency lint yang sama; audit tanpa dependency development masing-masing bersih. [Advisory GitHub](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) masih mencantumkan `Patched versions: None`, dan [rilis npm `braces`](https://www.npmjs.com/package/braces) masih pada `3.0.3`.

## Hasil

| Area | Full audit | Audit tanpa dependency development |
| --- | --- | --- |
| Backend | 5 high; rantai `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces` | 0 vulnerability |
| Frontend | 5 high; rantai yang sama | 0 vulnerability |

Advisory yang dilaporkan adalah [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), denial of service akibat pola bersarang dalam `braces`, dengan rentang terdampak `<=3.0.3`. Lockfile memakai `braces@3.0.3`; advisory pada 2026-10-12 masih mencantumkan belum ada versi perbaikan. Jadi belum ada versi `braces` yang dapat dipasang untuk menutup advisory ini.

`npm audit` menyarankan `eslint-config-next@14.2.35`, yang akan menurunkan major dari Next.js 16 ke Next.js 14. Downgrade framework lint hanya untuk menghilangkan laporan tidak diterapkan karena berisiko membuat toolchain tidak cocok. Advisory berada pada rantai lint/development dan tidak muncul pada audit dependency production (`--omit=dev`); hal ini mengurangi paparan runtime aplikasi, tetapi tidak menghilangkan risiko pada mesin pengembang/CI.

## Tindak lanjut

- Periksa kembali advisory setelah rilis upstream baru dan sebelum setiap rilis aplikasi.
- Perbarui ESLint/Next.js hanya melalui perubahan versi yang kompatibel dan review hasil build.
- Batasi CI yang menjalankan lint pada kode tepercaya; jangan menjalankan pola glob dari input pengguna.
- Task remediation tetap terbuka sampai dependency upstream yang diperbaiki tersedia atau pemilik rilis menyetujui pengecualian risiko tertulis.
