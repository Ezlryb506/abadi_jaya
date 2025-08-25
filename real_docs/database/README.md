# Dokumentasi Database - Abadi Jaya

Dokumentasi resmi struktur database untuk aplikasi Bengkel Las Abadi Jaya.

## Ruang Lingkup
- Tipe enum: `payment_method_enum`, `project_status_enum`
- Tabel inti: `customers`, `product_categories`, `products`, `transactions`, `payment_history`, `project_updates`, `admin_users`
- Fungsi & Trigger: `update_updated_at_column`, `handle_new_user`, `validate_project_status` dan trigger terkait
- RLS Policies per tabel (berbasis Supabase)
- Indeks untuk performa
- Query referensi untuk dashboard/admin

## Catatan Kebenaran
- Sumber kebenaran utama: `dokumen/01_database_schema.sql`
- Query referensi: `dokumen/02_database_queries.sql`
- Setup Supabase: `dokumen/03_supabase_setup.md`
- Gambar ERD (opsional): lihat file PNG di folder `dokumen/`

## Struktur Dokumen
- `schema.md` — Ringkasan entitas & relasi
- `tables/` — Detail setiap tabel
- `functions_triggers.md` — Fungsi & Trigger
- `rls_policies.md` — Kebijakan RLS
- `indexes.md` — Indeks & alasan
- `queries.md` — Kumpulan query penting
- `supabase_setup_notes.md` — Variabel env & klien JS

## Change Management
- Setiap perubahan skema harus diperbarui di file terkait dalam folder ini.
- Tandai breaking changes dan sediakan migrasi (SQL up/down) bila diperlukan.
