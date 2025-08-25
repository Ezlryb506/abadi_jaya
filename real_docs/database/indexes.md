# Indeks & Alasan Performa

## admin_users
- `admin_users_pkey (auth_user_id)` — PK
- `idx_admin_users_auth_user_id (auth_user_id)` — akses cepat pengecekan admin

## customers
- `customers_pkey (id)` — PK
- `customers_auth_user_id_key (auth_user_id)` — UNIQUE map ke auth
- `customers_phone_key (phone)` — UNIQUE pencarian by phone
- `idx_customers_auth_user_id (auth_user_id)` — join/auth mapping
- `idx_customers_phone (phone)` — pencarian by phone

## transactions
- `transactions_pkey (id)` — PK
- `idx_transactions_category_id (category_id)` — filter berdasarkan kategori
- `idx_transactions_customer (customer_id)` — filter berdasarkan pelanggan
- `idx_transactions_date (order_date)` — filter/sort tanggal
- `idx_transactions_product_id (product_id)` — filter by produk
- `idx_transactions_status (project_status)` — listing per status

## payment_history
- `payment_history_pkey (id)` — PK
- `idx_payment_history_transaction (transaction_id)` — agregasi/riwayat per transaksi

## project_updates
- `project_updates_pkey (id)` — PK
- `idx_project_updates_transaction (transaction_id)` — riwayat progres per transaksi

## product_categories
- `product_categories_pkey (id)` — PK

## reviews (disarankan)
- `reviews_pkey (id)` — PK
- `reviews_transaction_id_customer_id_key (transaction_id, customer_id)` — UNIQUE satu review per transaksi per customer
- `idx_reviews_transaction (transaction_id)` — agregasi/filter per transaksi
- `idx_reviews_customer_id (customer_id)` — daftar ulasan per pelanggan
- `idx_reviews_published (is_published)` — filter cepat published
- `idx_reviews_is_published_true (is_published) WHERE is_published IS TRUE` — partial index untuk listing publik

## products
- `products_pkey (id)` — PK
- `idx_products_category_id (category_id)` — filter per kategori
