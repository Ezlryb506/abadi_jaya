# Tabel: transactions

## Kolom
- `id SERIAL PK`
- `customer_id INTEGER NOT NULL` — FK `customers(id)` ON DELETE RESTRICT
- `category_id INTEGER NOT NULL` — FK `product_categories(id)` ON DELETE RESTRICT
- `product_id INTEGER NULL` — FK `products(id)` ON DELETE SET NULL
- `description TEXT NOT NULL`
- `estimated_price DECIMAL(15,2) NOT NULL CHECK (> 0)`
- `payment_method payment_method_enum NOT NULL`
- `total_paid DECIMAL(15,2) DEFAULT 0 CHECK (>= 0)`
- `project_status project_status_enum DEFAULT 'Survey'`
- `order_date TIMESTAMP DEFAULT NOW()`
- `estimated_completion DATE`
- `created_at TIMESTAMP DEFAULT NOW()`
- `updated_at TIMESTAMP DEFAULT NOW()`
- Constraint: `check_total_paid` memastikan `total_paid <= estimated_price`

## Trigger
- `update_transactions_updated_at` (BEFORE UPDATE) → `update_updated_at_column()`
- `validate_transactions_project_status` (BEFORE UPDATE) → `validate_project_status()`

## Indeks
- `idx_transactions_customer (customer_id)`
- `idx_transactions_status (project_status)`
- `idx_transactions_date (order_date)`

## RLS (ringkas)
- Admin: FULL ACCESS via `is_admin()`
- User: hanya bisa SELECT/INSERT/UPDATE/DELETE transaksi miliknya (berdasarkan mapping `customers.auth_user_id`).
