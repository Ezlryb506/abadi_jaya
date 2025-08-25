# Fungsi & Trigger

## update_updated_at_column()
- Tipe: FUNCTION (plpgsql)
- Tujuan: mengisi `NEW.updated_at = NOW()` pada `BEFORE UPDATE`
- Digunakan oleh: trigger `update_transactions_updated_at` di `transactions`

## handle_new_user()
- Tipe: FUNCTION (plpgsql, SECURITY DEFINER)
- Tujuan: saat user baru dibuat di `auth.users`, otomatis insert ke `customers`
- Sumber data: `NEW.raw_user_meta_data` → `name`, `phone`, `address`
- Trigger: `on_auth_user_created` (AFTER INSERT ON `auth.users`)

## validate_project_status()
- Tipe: FUNCTION (plpgsql)
- Tujuan: mencegah status proyek mundur (NEW < OLD → exception)
- Trigger: `validate_transactions_project_status` (BEFORE UPDATE ON `transactions`)

## tr_payment_history_recalc_total_paid()
- Tipe: FUNCTION (plpgsql)
- Tujuan: melakukan re-kalkulasi `transactions.total_paid` setiap ada perubahan pada `payment_history` (INSERT/UPDATE/DELETE)
- Logika umum: agregasi `SUM(payment_amount)` per `transaction_id` dan update kolom `transactions.total_paid`
- Digunakan oleh: trigger `trg_payment_history_recalc_total_paid` pada `payment_history`

## fn_recalc_total_paid(transaction_id int)
- Tipe: FUNCTION (plpgsql, SECURITY DEFINER)
- Tujuan: menghitung ulang total pembayaran pada tabel `transactions` berdasarkan agregasi `payment_history` untuk `transaction_id` tertentu.
- Peran di sistem: dipanggil oleh `tr_payment_history_recalc_total_paid()` pada event INSERT/UPDATE/DELETE `payment_history`.

---

# Daftar Trigger (sinkron dengan verifikasi)
- `update_transactions_updated_at` (BEFORE UPDATE ON `transactions`) → `update_updated_at_column()`
- `validate_transactions_project_status` (BEFORE UPDATE ON `transactions`) → `validate_project_status()`
- `trg_payment_history_recalc_total_paid` (AFTER INSERT OR DELETE OR UPDATE ON `payment_history`) → `tr_payment_history_recalc_total_paid()`
