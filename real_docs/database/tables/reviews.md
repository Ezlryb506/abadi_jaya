# Tabel: reviews

Sumber: hasil inspeksi Supabase (information_schema.columns)

## Kolom (saat ini di DB)
- `id SERIAL PK`
- `transaction_id INTEGER NOT NULL`
- `customer_id INTEGER NOT NULL`
- `rating SMALLINT NOT NULL` — CHECK `(rating BETWEEN 1 AND 5)` tersedia
- `comment TEXT NULL`
- `is_published BOOLEAN DEFAULT false`
- `show_name BOOLEAN DEFAULT false` — kontrol penayangan identitas
- `created_at TIMESTAMP DEFAULT NOW()`
- `display_name TEXT NULL` — nama tampilan jika `show_name = true`
- `product_name TEXT NULL` — snapshot nama produk saat review dibuat (opsional)
- `product_description TEXT NULL` — snapshot deskripsi produk saat review dibuat (opsional)

## Relasi (sesuai DB saat ini)
- `transaction_id` → FK ke `transactions(id)` ON DELETE CASCADE (`reviews_transaction_id_fkey`)
- `customer_id` → FK ke `customers(id)` ON DELETE CASCADE (`reviews_customer_id_fkey`)

## Indeks/Constraint (sesuai DB saat ini)
- `UNIQUE (transaction_id, customer_id)` (`reviews_transaction_id_customer_id_key`)
- Disarankan: tambah index bantu jika beban query tinggi
  - `idx_reviews_transaction (transaction_id)`
  - `idx_reviews_customer (customer_id)`

## RLS (disarankan)
- Admin: FULL ACCESS via `is_admin()`
- Public: SELECT hanya `is_published = true`
- User: SELECT/INSERT/UPDATE/DELETE review miliknya (berdasarkan `customers.auth_user_id` yang terkait `customer_id`)

Catatan: Penambahan constraint/foreign key dan policy RLS perlu dijalankan via migrasi SQL jika belum ada di database.
