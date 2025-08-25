# Query Referensi (Dashboard/Admin)

Sumber: `dokumen/02_database_queries.sql`

## Overview
- Ringkasan transaksi (count per status, nilai total, outstanding)
- Agregasi per status, per metode pembayaran, per kategori produk
- Daftar transaksi hari ini, progres terbaru, riwayat pembayaran
- Pencarian & filter dengan parameter

## Catatan Implementasi
- Gunakan `JOIN` eksplisit dan `LEFT JOIN LATERAL` untuk latest update (`project_updates`).
- Urutan status menggunakan CASE untuk sorting bertingkat (Survey→Completed).
- Parameterized query untuk pencarian dan filter tanggal.

## Contoh-potongan
- Progress semua transaksi dengan latest update via lateral join.
- Analitik kategori (COUNT, SUM, AVG, MIN, MAX) dengan `LEFT JOIN` ke `transactions`.
