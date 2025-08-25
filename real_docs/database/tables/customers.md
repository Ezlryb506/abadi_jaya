# Tabel: customers

Sumber: `dokumen/01_database_schema.sql`

## Kolom
- `id SERIAL PK`
- `auth_user_id UUID UNIQUE` — FK ke `auth.users(id)`, `ON DELETE SET NULL`
- `name VARCHAR(255) NOT NULL`
- `phone VARCHAR(20) UNIQUE NOT NULL`
- `address TEXT`
- `email VARCHAR(255)`
- `created_at TIMESTAMP DEFAULT NOW()`

## Indeks
- `idx_customers_phone (phone)`
- `idx_customers_auth_user_id (auth_user_id)`

## RLS (ringkas)
- Enable RLS.
- User dapat SELECT/INSERT/UPDATE baris sendiri (berdasarkan `auth_user_id`).
- Admin dapat SELECT semua baris via function `is_admin()`.

## Catatan
- Kolom `auth_user_id` dapat null (user manual/non-auth), tetapi jika terhubung ke Supabase Auth maka relasi otomatis dapat dibuat via trigger `handle_new_user`.
