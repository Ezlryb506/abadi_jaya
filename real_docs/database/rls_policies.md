# Row Level Security (RLS) Policies

Catatan: Kebijakan di bawah ini merujuk pada definisi di `01_database_schema.sql`. Jika terdapat konflik dengan catatan lama, dokumen ini menjadi rujukan.

## Helper Function: is_admin()
- Mengembalikan `TRUE` jika `auth.uid()` terdaftar di `public.admin_users`.
- Dipakai untuk memberikan akses penuh ke admin di `transactions` dan read-all di `customers`.

## customers
- Enable RLS.
- SELECT/UPDATE/INSERT: hanya baris milik sendiri (`auth.uid() = auth_user_id`).
- Admin dapat SELECT semua data menggunakan `USING (is_admin())` (lihat policy "Admin can view all customers").

## transactions
- Enable RLS.
- Admin: FULL ACCESS (`FOR ALL USING is_admin() WITH CHECK is_admin()`).
- User non-admin:
  - SELECT: hanya transaksi yang `customer_id`-nya merujuk ke `customers.auth_user_id = auth.uid()`.
  - INSERT/UPDATE/DELETE: sama seperti di atas dengan `USING`/`WITH CHECK`.

## Tabel lain
- `payment_history`, `project_updates`, `product_categories`, `products`: sesuaikan kebutuhan; praktik umum adalah mengikuti akses berbasis transaksi induk untuk entitas turunan.

## reviews (disarankan)
- Enable RLS.
- Admin: FULL ACCESS menggunakan `is_admin()`.
- Public: `SELECT` hanya untuk baris dengan `is_published = true`.
- User non-admin:
  - `SELECT`: boleh melihat miliknya sendiri (berdasarkan `customers.auth_user_id` yang terkait dengan `reviews.customer_id`).
  - `INSERT/UPDATE/DELETE`: hanya untuk baris miliknya sendiri (gunakan `USING`/`WITH CHECK` serupa pola `transactions`).
  - Opsional: batasi 1 ulasan per `transaction_id` per `customer_id` (UNIQUE partial index/constraint).

---

# Kebijakan Aktif (hasil verifikasi No. 9)

Di bawah ini adalah daftar policy aktual yang terdeteksi di database Anda. Gunakan bagian ini sebagai referensi operasional.

## admin_users
- `admin_select_self` (SELECT, roles: public)
  - USING: `auth_user_id = auth.uid()`

## customers
- `customers_insert` (INSERT, roles: public)
  - WITH CHECK: `auth_user_id = auth.uid()`
- `customers_select` (SELECT, roles: public)
  - USING: `is_admin() OR auth_user_id = auth.uid()`
- `customers_update` (UPDATE, roles: public)
  - USING/WITH CHECK: `is_admin() OR auth_user_id = auth.uid()`

## products
- `products_select` (SELECT, roles: public)
  - USING: `true` (publik bisa baca)
- `products_insert` (INSERT, roles: public)
  - WITH CHECK: `is_admin()`
- `products_update` (UPDATE, roles: public)
  - USING/WITH CHECK: `is_admin()`
- `products_delete` (DELETE, roles: public)
  - USING: `is_admin()`

## product_categories
- `Enable read access for all users` (SELECT, roles: public)
  - USING: `true`

## transactions
- `transactions_select` (SELECT, roles: public)
  - USING: `is_admin() OR auth.uid() = (SELECT c.auth_user_id FROM customers c WHERE c.id = transactions.customer_id)`
- `transactions_insert` (INSERT, roles: public)
  - WITH CHECK: `auth.uid() = (SELECT c.auth_user_id FROM customers c WHERE c.id = transactions.customer_id)`
- `transactions_update` (UPDATE, roles: public)
  - USING/WITH CHECK: `is_admin() OR auth.uid() = (SELECT c.auth_user_id FROM customers c WHERE c.id = transactions.customer_id)`
- `transactions_delete` (DELETE, roles: public)
  - USING: `is_admin() OR auth.uid() = (SELECT c.auth_user_id FROM customers c WHERE c.id = transactions.customer_id)`

## payment_history
- `payment_history_select` (SELECT, roles: public)
  - USING: `is_admin() OR auth.uid() = (SELECT c.auth_user_id FROM customers c WHERE c.id = (SELECT t.customer_id FROM transactions t WHERE t.id = payment_history.transaction_id))`
- `payment_history_insert` (INSERT, roles: public)
  - WITH CHECK: `is_admin()`
- `payment_history_update` (UPDATE, roles: public)
  - USING/WITH CHECK: `is_admin()`
- `payment_history_delete` (DELETE, roles: public)
  - USING: `is_admin()`

## project_updates
- `project_updates_select` (SELECT, roles: public)
  - USING: `is_admin() OR auth.uid() = (SELECT c.auth_user_id FROM customers c WHERE c.id = (SELECT t.customer_id FROM transactions t WHERE t.id = project_updates.transaction_id))`
- `project_updates_insert` (INSERT, roles: public)
  - WITH CHECK: `is_admin()`
- `project_updates_update` (UPDATE, roles: public)
  - USING/WITH CHECK: `is_admin()`
- `project_updates_delete` (DELETE, roles: public)
  - USING: `is_admin()`

## reviews
- `reviews_select` (SELECT, roles: public)
  - USING: `is_admin() OR auth.uid() = (SELECT c.auth_user_id FROM customers c WHERE c.id = reviews.customer_id) OR COALESCE(is_published,false) IS TRUE`
- `reviews_insert` (INSERT, roles: public)
  - WITH CHECK: `is_admin() OR auth.uid() = (SELECT c.auth_user_id FROM customers c WHERE c.id = reviews.customer_id)`
- `reviews_update` (UPDATE, roles: public)
  - USING/WITH CHECK: `is_admin() OR auth.uid() = (SELECT c.auth_user_id FROM customers c WHERE c.id = reviews.customer_id)`
- `reviews_delete` (DELETE, roles: public)
  - USING: `is_admin() OR auth.uid() = (SELECT c.auth_user_id FROM customers c WHERE c.id = reviews.customer_id)`
