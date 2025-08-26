-- =====================================================
-- MIGRATED COPY: SCHEMA DATABASE BENGKEL LAS ABADI JAYA
-- Source: dokumen/01_database_schema.sql (kept as authoritative SQL copy)
-- Note: Tambahkan di migrasi berikutnya jika ada fungsi/trigger/indeks tambahan
--       yang sudah terdokumentasi di real_docs (mis. recalculation payment triggers)
-- =====================================================

-- Definisi tipe ENUM PostgreSQL
CREATE TYPE payment_method_enum AS ENUM ('DP', 'Cicil', 'Full Payment');
CREATE TYPE project_status_enum AS ENUM ('Survey', 'Design', 'Production', 'Installation', 'Completed');

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    -- Terkait Supabase Auth
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel product_categories (kategori produk)
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price_range VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel products (daftar produk katalog)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(15,2),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel transactions (transaksi/pesanan)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    category_id INTEGER NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    estimated_price DECIMAL(15,2) NOT NULL CHECK (estimated_price > 0),
    payment_method payment_method_enum NOT NULL,
    total_paid DECIMAL(15,2) DEFAULT 0 CHECK (total_paid >= 0),
    project_status project_status_enum DEFAULT 'Survey',
    order_date TIMESTAMP DEFAULT NOW(),
    estimated_completion DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    -- Constraint untuk memastikan total_paid tidak melebihi estimated_price
    CONSTRAINT check_total_paid CHECK (total_paid <= estimated_price)
);

-- Tabel payment_history (riwayat pembayaran)
CREATE TABLE payment_history (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    payment_amount DECIMAL(15,2) NOT NULL CHECK (payment_amount > 0),
    payment_date TIMESTAMP DEFAULT NOW(),
    payment_proof TEXT,
    payment_notes TEXT,
    recorded_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel project_updates (update progress proyek)
CREATE TABLE project_updates (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    status project_status_enum NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    updated_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel untuk menyimpan user admin
CREATE TABLE admin_users (
    auth_user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- TRIGGERS DAN FUNCTIONS
-- =====================================================

-- Function untuk update updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- INTEGRASI SUPABASE AUTH → CUSTOMERS
-- =====================================================

-- Function: otomatis membuat baris customer saat user baru terdaftar di Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO customers (auth_user_id, name, email, phone, address)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'address', '')
    )
    ON CONFLICT (auth_user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: jalankan handle_new_user setelah user auth dibuat
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger untuk update updated_at otomatis
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function untuk validasi status project
CREATE OR REPLACE FUNCTION validate_project_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Pastikan status project tidak bisa mundur
    IF NEW.project_status < OLD.project_status THEN
        RAISE EXCEPTION 'Project status cannot go backwards';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk validasi status project
CREATE TRIGGER validate_transactions_project_status
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION validate_project_status();

-- =====================================================
-- INDEXES UNTUK PERFORMANCE
-- =====================================================

-- Index untuk pencarian customer berdasarkan phone
CREATE INDEX idx_customers_phone ON customers(phone);

-- Index untuk relasi auth_user_id
CREATE INDEX idx_customers_auth_user_id ON customers(auth_user_id);

-- Index untuk pencarian transaksi berdasarkan customer
CREATE INDEX idx_transactions_customer ON transactions(customer_id);

-- Index untuk pencarian transaksi berdasarkan status
CREATE INDEX idx_transactions_status ON transactions(project_status);

-- Index untuk pencarian transaksi berdasarkan tanggal
CREATE INDEX idx_transactions_date ON transactions(order_date);

-- Index untuk pencarian payment history berdasarkan transaksi
CREATE INDEX idx_payment_history_transaction ON payment_history(transaction_id);

-- Index untuk pencarian project updates berdasarkan transaksi
CREATE INDEX idx_project_updates_transaction ON project_updates(transaction_id);

-- =====================================================
-- RLS (ROW LEVEL SECURITY) DASAR
-- =====================================================

-- Aktifkan RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy: user hanya bisa lihat baris miliknya
DROP POLICY IF EXISTS customers_select_own ON customers;
CREATE POLICY customers_select_own
    ON customers FOR SELECT
    USING (auth.uid() = auth_user_id);

-- Policy: user hanya bisa update baris miliknya
DROP POLICY IF EXISTS customers_update_own ON customers;
CREATE POLICY customers_update_own
    ON customers FOR UPDATE
    USING (auth.uid() = auth_user_id)
    WITH CHECK (auth.uid() = auth_user_id);

-- RLS Policies untuk tabel customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policy untuk SELECT (baca data sendiri)
CREATE POLICY customers_select_own ON public.customers
    FOR SELECT USING (auth.uid() = auth_user_id);

-- Policy untuk INSERT (buat record baru)
CREATE POLICY customers_insert_own ON public.customers
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Policy untuk UPDATE (update data sendiri)
CREATE POLICY customers_update_own ON public.customers
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Policy tambahan: Admin bisa melihat semua data customer
CREATE POLICY "Admin can view all customers"
    ON public.customers
    FOR SELECT
    USING (is_admin());

-- =====================================================
-- RLS (ROW LEVEL SECURITY) UNTUK TRANSACTIONS
-- =====================================================

-- Aktifkan RLS untuk tabel transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Function untuk memeriksa apakah user adalah admin dengan mengecek tabel admin_users
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE auth_user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy 1: Admin memiliki akses penuh ke semua transaksi
CREATE POLICY "Admin full access on transactions"
    ON public.transactions
    FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- Policy 2: User hanya bisa melihat transaksi miliknya
CREATE POLICY "User can see own transactions"
    ON public.transactions
    FOR SELECT
    USING (
        (SELECT auth_user_id FROM public.customers WHERE id = customer_id) = auth.uid()
    );

-- Policy 3: User hanya bisa membuat transaksi untuk dirinya sendiri
CREATE POLICY "User can insert own transactions"
    ON public.transactions
    FOR INSERT
    WITH CHECK (
        (SELECT auth_user_id FROM public.customers WHERE id = customer_id) = auth.uid()
    );

-- Policy 4: User hanya bisa mengupdate transaksi miliknya
CREATE POLICY "User can update own transactions"
    ON public.transactions
    FOR UPDATE
    USING (
        (SELECT auth_user_id FROM public.customers WHERE id = customer_id) = auth.uid()
    )
    WITH CHECK (
        (SELECT auth_user_id FROM public.customers WHERE id = customer_id) = auth.uid()
    );

-- Policy 5: User hanya bisa menghapus transaksi miliknya
CREATE POLICY "User can delete own transactions"
    ON public.transactions
    FOR DELETE
    USING (
        (SELECT auth_user_id FROM public.customers WHERE id = customer_id) = auth.uid()
    );

-- SAMPLE DATA UNTUK TESTING (opsional) -> sudah tidak digunakan
-- (Dapat dipindahkan ke seed terpisah jika perlu)
INSERT INTO product_categories (name, description, base_price_range) VALUES
('Pagar', 'Pagar besi, stainless, minimalis', '500k - 3jt'),
('Kanopi', 'Kanopi carport, teras, garasi', '1jt - 5jt'),
('Railing Tangga', 'Railing tangga besi dan stainless', '800k - 2.5jt'),
('Pintu Besi', 'Pintu besi, rolling door, garasi', '1.5jt - 8jt'),
('Jendela', 'Jendela besi, kasa nyamuk', '300k - 1.5jt'),
('Teralis', 'Teralis jendela, ventilasi', '200k - 1jt'),
('Tangga Putar', 'Tangga spiral, tangga putar', '2jt - 10jt'),
('Minimalis', 'Produk dengan desain minimalis', '500k - 5jt'),
('Stainless', 'Produk stainless steel premium', '1jt - 15jt');

INSERT INTO products (category_id, name, description, price, image_url) VALUES
(1, 'Pagar Besi Minimalis', 'Pagar besi dengan desain minimalis, finishing cat duco.', 2500000, 'https://placehold.co/400x300?text=Pagar+Besi'),
(2, 'Kanopi Baja Ringan', 'Kanopi carport baja ringan, atap spandek, ukuran 6x4m.', 3500000, 'https://placehold.co/400x300?text=Kanopi'),
(3, 'Railing Tangga Stainless', 'Railing tangga bahan stainless steel, motif modern.', 1800000, 'https://placehold.co/400x300?text=Railing+Stainless'),
(4, 'Pintu Besi Garasi', 'Pintu besi untuk garasi, sistem sliding, kuat dan aman.', 4200000, 'https://placehold.co/400x300?text=Pintu+Besi'),
(5, 'Jendela Kasa Nyamuk', 'Jendela besi dengan kasa nyamuk, cocok untuk rumah tropis.', 900000, 'https://placehold.co/400x300?text=Jendela'),
(6, 'Teralis Jendela Motif', 'Teralis jendela motif klasik, finishing powder coating.', 700000, 'https://placehold.co/400x300?text=Teralis'),
(7, 'Tangga Putar Spiral', 'Tangga putar model spiral, bahan besi hollow.', 6500000, 'https://placehold.co/400x300?text=Tangga+Putar'),
(9, 'Pagar Stainless Premium', 'Pagar stainless steel premium, desain mewah dan tahan karat.', 8000000, 'https://placehold.co/400x300?text=Stainless');

INSERT INTO customers (name, phone, address, email) VALUES
('John Doe', '+628123456789', 'Jl. Contoh No. 123, Jakarta', 'john@email.com'),
('Jane Smith', '+628987654321', 'Jl. Sample No. 456, Bandung', 'jane@email.com'),
('Bob Wilson', '+628555666777', 'Jl. Test No. 789, Surabaya', 'bob@email.com');

INSERT INTO transactions (customer_id, category_id, product_id, description, estimated_price, payment_method, project_status) VALUES
(1, 1, 1, 'Pagar besi minimalis tinggi 1.5m, panjang 10m', 2500000, 'Cicil', 'Survey'),
(2, 2, 2, 'Kanopi carport stainless 6x4m', 3500000, 'DP', 'Design'),
(3, 3, 3, 'Railing tangga putar stainless', 1800000, 'Full Payment', 'Production');
