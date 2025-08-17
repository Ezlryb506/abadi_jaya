-- =====================================================
-- SCHEMA DATABASE BENGKEL LAS ABADI JAYA
-- =====================================================

-- Tabel customers (pelanggan)
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
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

-- Tabel transactions (transaksi/pesanan)
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    category_id INTEGER NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    estimated_price DECIMAL(15,2) NOT NULL CHECK (estimated_price > 0),
    payment_method ENUM('DP', 'Cicil', 'Full Payment') NOT NULL,
    total_paid DECIMAL(15,2) DEFAULT 0 CHECK (total_paid >= 0),
    project_status ENUM('Survey', 'Design', 'Production', 'Installation', 'Completed') DEFAULT 'Survey',
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
    status ENUM('Survey', 'Design', 'Production', 'Installation', 'Completed') NOT NULL,
    description TEXT NOT NULL,
    photo_url TEXT,
    updated_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
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
-- SAMPLE DATA UNTUK TESTING
-- =====================================================

-- Insert sample categories
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

-- Insert sample customers
INSERT INTO customers (name, phone, address, email) VALUES
('John Doe', '+628123456789', 'Jl. Contoh No. 123, Jakarta', 'john@email.com'),
('Jane Smith', '+628987654321', 'Jl. Sample No. 456, Bandung', 'jane@email.com'),
('Bob Wilson', '+628555666777', 'Jl. Test No. 789, Surabaya', 'bob@email.com');

-- Insert sample transactions
INSERT INTO transactions (customer_id, category_id, description, estimated_price, payment_method, project_status) VALUES
(1, 1, 'Pagar besi minimalis tinggi 1.5m, panjang 10m', 2500000, 'Cicil', 'Survey'),
(2, 2, 'Kanopi carport stainless 6x4m', 3500000, 'DP', 'Design'),
(3, 3, 'Railing tangga putar stainless', 1800000, 'Full Payment', 'Production');
