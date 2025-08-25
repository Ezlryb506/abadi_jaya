# Tabel: payment_history

## Kolom
- `id SERIAL PK`
- `transaction_id INTEGER NOT NULL` — FK `transactions(id)` ON DELETE CASCADE
- `payment_amount DECIMAL(15,2) NOT NULL CHECK (> 0)`
- `payment_date TIMESTAMP DEFAULT NOW()`
- `payment_proof TEXT`
- `payment_notes TEXT`
- `recorded_by VARCHAR(100) NOT NULL`
- `created_at TIMESTAMP DEFAULT NOW()`

## Indeks
- `idx_payment_history_transaction (transaction_id)`

## RLS (saran)
- Ikuti akses berbasis transaksi induk (admin penuh, user hanya miliknya).
