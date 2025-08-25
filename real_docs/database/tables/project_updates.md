# Tabel: project_updates

## Kolom
- `id SERIAL PK`
- `transaction_id INTEGER NOT NULL` — FK `transactions(id)` ON DELETE CASCADE
- `status project_status_enum NOT NULL`
- `description TEXT NOT NULL`
- `photo_url TEXT`
- `updated_by VARCHAR(100) NOT NULL`
- `created_at TIMESTAMP DEFAULT NOW()`

## Indeks
- `idx_project_updates_transaction (transaction_id)`

## RLS (saran)
- Ikuti akses berbasis transaksi induk.
