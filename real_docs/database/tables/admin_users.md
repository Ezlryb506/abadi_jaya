# Tabel: admin_users

## Kolom
- `auth_user_id UUID PK` — FK `auth.users(id)` ON DELETE CASCADE
- `created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL`

## Fungsi Terkait
- `is_admin()` menggunakan tabel ini untuk menentukan hak akses admin.
