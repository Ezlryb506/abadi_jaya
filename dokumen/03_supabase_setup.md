# Setup Supabase untuk Website Bengkel Las

## 1. Membuat Proyek Supabase

### Langkah-langkah:
1. Kunjungi [supabase.com](https://supabase.com)
2. Sign up/Login dengan akun GitHub atau Google
3. Klik "New Project"
4. Pilih organization (buat baru jika belum ada)
5. Isi nama proyek: `bengkel-las-abadi-jaya`
6. Pilih database password (simpan dengan aman)
7. Pilih region terdekat (Asia Southeast - Singapore)
8. Klik "Create new project"

## 2. Konfigurasi Environment Variables

### Buat file `.env.local` di root proyek:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Cara mendapatkan credentials:
1. Di dashboard Supabase, klik "Settings" → "API"
2. Copy "Project URL" ke `NEXT_PUBLIC_SUPABASE_URL`
3. Copy "anon public" ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy "service_role" ke `SUPABASE_SERVICE_ROLE_KEY`

## 3. Setup Database Schema

### Jalankan SQL dari file `01_database_schema.sql`:
1. Di dashboard Supabase, klik "SQL Editor"
2. Copy semua isi file `01_database_schema.sql`
3. Paste dan klik "Run"

### Verifikasi tabel yang dibuat:
- `customers`
- `product_categories`
- `transactions`
- `payment_history`
- `project_updates`

## 4. Setup Row Level Security (RLS)

### Enable RLS untuk semua tabel:
```sql
-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- Policy untuk product_categories (public read)
CREATE POLICY "Allow public read access" ON product_categories
    FOR SELECT USING (true);

-- Policy untuk customers (admin only)
CREATE POLICY "Allow admin access" ON customers
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy untuk transactions (admin only)
CREATE POLICY "Allow admin access" ON transactions
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy untuk payment_history (admin only)
CREATE POLICY "Allow admin access" ON payment_history
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy untuk project_updates (admin only)
CREATE POLICY "Allow admin access" ON project_updates
    FOR ALL USING (auth.role() = 'authenticated');
```

## 5. Setup Storage untuk Upload File

### Buat bucket untuk bukti pembayaran:
1. Di dashboard Supabase, klik "Storage"
2. Klik "New bucket"
3. Nama: `payment-proofs`
4. Public bucket: `false`
5. File size limit: `10MB`
6. Allowed MIME types: `image/*`

### Buat bucket untuk foto progress:
1. Klik "New bucket"
2. Nama: `project-photos`
3. Public bucket: `false`
4. File size limit: `10MB`
5. Allowed MIME types: `image/*`

## 6. Setup Authentication (Opsional)

### Jika ingin ada login admin:
1. Di dashboard Supabase, klik "Authentication"
2. Klik "Settings"
3. Enable "Enable email confirmations": `false`
4. Enable "Enable phone confirmations": `false`

### Buat user admin pertama:
1. Klik "Users"
2. Klik "Add user"
3. Isi email dan password
4. Set role: `authenticated`

## 7. Testing Database

### Test insert data:
```sql
-- Test insert customer
INSERT INTO customers (name, phone, address) 
VALUES ('Test Customer', '+628123456789', 'Jl. Test No. 1');

-- Test insert category
INSERT INTO product_categories (name, description) 
VALUES ('Test Category', 'Test Description');

-- Test insert transaction
INSERT INTO transactions (customer_id, category_id, description, estimated_price, payment_method)
VALUES (1, 1, 'Test Project', 1000000, 'DP');
```

### Verifikasi data:
```sql
SELECT * FROM customers;
SELECT * FROM product_categories;
SELECT * FROM transactions;
```

## 8. Troubleshooting

### Error umum dan solusi:

**Error: "relation does not exist"**
- Pastikan SQL schema sudah dijalankan
- Refresh halaman SQL Editor

**Error: "permission denied"**
- Pastikan RLS sudah disetup dengan benar
- Check policy yang dibuat

**Error: "connection failed"**
- Verifikasi environment variables
- Check URL dan API key

## 9. Next Steps

### Setelah setup selesai:
1. Install Supabase client di Next.js
2. Buat service layer untuk database operations
3. Implementasi API routes
4. Buat UI components untuk admin dashboard

### Referensi:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
