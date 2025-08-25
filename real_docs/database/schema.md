# Ringkasan Skema & Relasi

## Enum
- `payment_method_enum`: `DP | Cicil | Full Payment`
- `project_status_enum`: `Survey | Design | Production | Installation | Completed`

## Entitas Utama
- `customers (1)` — pelanggan, terhubung ke `auth.users` via `auth_user_id` (opsional)
- `product_categories (N)` — kategori produk
- `products (N)` — produk katalog, FK `category_id -> product_categories.id`
- `transactions (N)` — pesanan, FK ke `customers`, `product_categories`, opsional `products`
- `payment_history (N)` — pembayaran terkait `transactions`
- `project_updates (N)` — progres terkait `transactions`
- `admin_users (N)` — daftar admin, PK = `auth_user_id` (referensi `auth.users`)
- `reviews (N)` — ulasan pelanggan terkait transaksi/produk (terkait `transactions` dan `customers`)

## Relasi
- `customers.id` <- `transactions.customer_id` (RESTRICT)
- `product_categories.id` <- `products.category_id` (RESTRICT)
- `product_categories.id` <- `transactions.category_id` (RESTRICT)
- `products.id` <- `transactions.product_id` (SET NULL)
- `transactions.id` <- `payment_history.transaction_id` (CASCADE)
- `transactions.id` <- `project_updates.transaction_id` (CASCADE)
- `auth.users.id` <- `customers.auth_user_id` (SET NULL)
- `auth.users.id` <- `admin_users.auth_user_id` (CASCADE)
- `transactions.id` <- `reviews.transaction_id` (disarankan CASCADE/RESTRICT sesuai kebutuhan)
- `customers.id` <- `reviews.customer_id` (CASCADE)

## Aturan Bisnis Utama
- `transactions.total_paid` tidak boleh melebihi `estimated_price`
- `transactions.project_status` tidak boleh mundur (dipastikan trigger)
- Otomasi `updated_at` pada `transactions` saat update
