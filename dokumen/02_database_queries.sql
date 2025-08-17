-- =====================================================
-- QUERY DATABASE UNTUK DASHBOARD ADMIN
-- =====================================================

-- =====================================================
-- 1. DASHBOARD OVERVIEW
-- =====================================================

-- Ringkasan semua transaksi
SELECT 
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN project_status = 'Survey' THEN 1 END) as pending_survey,
    COUNT(CASE WHEN project_status = 'Design' THEN 1 END) as in_design,
    COUNT(CASE WHEN project_status = 'Production' THEN 1 END) as in_production,
    COUNT(CASE WHEN project_status = 'Installation' THEN 1 END) as in_installation,
    COUNT(CASE WHEN project_status = 'Completed' THEN 1 END) as completed,
    SUM(estimated_price) as total_value,
    SUM(total_paid) as total_received,
    SUM(estimated_price - total_paid) as total_outstanding
FROM transactions;

-- =====================================================
-- 2. TRANSAKSI BERDASARKAN STATUS
-- =====================================================

-- Transaksi berdasarkan status project
SELECT 
    project_status,
    COUNT(*) as total_transactions,
    SUM(estimated_price) as total_value,
    AVG(estimated_price) as average_value
FROM transactions 
GROUP BY project_status
ORDER BY 
    CASE project_status
        WHEN 'Survey' THEN 1
        WHEN 'Design' THEN 2
        WHEN 'Production' THEN 3
        WHEN 'Installation' THEN 4
        WHEN 'Completed' THEN 5
    END;

-- =====================================================
-- 3. TRANSAKSI HARI INI
-- =====================================================

-- Transaksi yang dibuat hari ini
SELECT 
    t.id,
    t.description,
    t.estimated_price,
    t.payment_method,
    t.project_status,
    c.name as customer_name,
    c.phone,
    pc.name as category_name
FROM transactions t
JOIN customers c ON t.customer_id = c.id
JOIN product_categories pc ON t.category_id = pc.id
WHERE DATE(t.created_at) = CURDATE()
ORDER BY t.created_at DESC;

-- =====================================================
-- 4. PEMBAYARAN DAN KEUANGAN
-- =====================================================

-- Ringkasan pembayaran berdasarkan metode
SELECT 
    payment_method,
    COUNT(*) as total_transactions,
    SUM(estimated_price) as total_value,
    SUM(total_paid) as total_received,
    SUM(estimated_price - total_paid) as total_outstanding,
    ROUND((SUM(total_paid) / SUM(estimated_price)) * 100, 2) as payment_percentage
FROM transactions 
GROUP BY payment_method;

-- Transaksi dengan cicilan yang perlu dibayar
SELECT 
    t.id,
    t.description,
    c.name as customer_name,
    c.phone,
    t.estimated_price,
    t.total_paid,
    (t.estimated_price - t.total_paid) as remaining_amount,
    t.order_date,
    t.estimated_completion
FROM transactions t
JOIN customers c ON t.customer_id = c.id
WHERE t.payment_method = 'Cicil' 
    AND t.total_paid < t.estimated_price
    AND t.project_status != 'Completed'
ORDER BY t.order_date ASC;

-- =====================================================
-- 5. TRACKING PROGRESS
-- =====================================================

-- Progress semua transaksi
SELECT 
    t.id,
    t.description,
    t.project_status,
    t.estimated_price,
    t.total_paid,
    (t.estimated_price - t.total_paid) as remaining_amount,
    c.name as customer_name,
    c.phone,
    pc.name as category_name,
    pu.description as latest_update,
    pu.created_at as last_update,
    pu.updated_by as last_updated_by
FROM transactions t
JOIN customers c ON t.customer_id = c.id
JOIN product_categories pc ON t.category_id = pc.id
LEFT JOIN LATERAL (
    SELECT description, created_at, updated_by
    FROM project_updates 
    WHERE transaction_id = t.id 
    ORDER BY created_at DESC 
    LIMIT 1
) pu ON true
ORDER BY 
    CASE t.project_status
        WHEN 'Survey' THEN 1
        WHEN 'Design' THEN 2
        WHEN 'Production' THEN 3
        WHEN 'Installation' THEN 4
        WHEN 'Completed' THEN 5
    END,
    t.created_at DESC;

-- =====================================================
-- 6. PAYMENT HISTORY
-- =====================================================

-- Semua pembayaran untuk transaksi tertentu
SELECT 
    ph.payment_date,
    ph.payment_amount,
    ph.payment_notes,
    ph.recorded_by,
    ph.payment_proof,
    t.description,
    c.name as customer_name
FROM payment_history ph
JOIN transactions t ON ph.transaction_id = t.id
JOIN customers c ON t.customer_id = c.id
WHERE ph.transaction_id = $1
ORDER BY ph.payment_date DESC;

-- Riwayat pembayaran hari ini
SELECT 
    ph.payment_date,
    ph.payment_amount,
    ph.payment_notes,
    ph.recorded_by,
    t.description,
    c.name as customer_name,
    c.phone
FROM payment_history ph
JOIN transactions t ON ph.transaction_id = t.id
JOIN customers c ON t.customer_id = c.id
WHERE DATE(ph.payment_date) = CURDATE()
ORDER BY ph.payment_date DESC;

-- =====================================================
-- 7. CUSTOMER ANALYSIS
-- =====================================================

-- Customer dengan transaksi terbanyak
SELECT 
    c.id,
    c.name,
    c.phone,
    c.email,
    COUNT(t.id) as total_transactions,
    SUM(t.estimated_price) as total_spent,
    AVG(t.estimated_price) as average_transaction_value,
    MAX(t.created_at) as last_transaction_date
FROM customers c
LEFT JOIN transactions t ON c.id = t.customer_id
GROUP BY c.id, c.name, c.phone, c.email
ORDER BY total_transactions DESC, total_spent DESC;

-- =====================================================
-- 8. PRODUCT CATEGORY ANALYSIS
-- =====================================================

-- Analisis kategori produk
SELECT 
    pc.id,
    pc.name,
    pc.description,
    pc.base_price_range,
    COUNT(t.id) as total_orders,
    SUM(t.estimated_price) as total_value,
    AVG(t.estimated_price) as average_price,
    MIN(t.estimated_price) as min_price,
    MAX(t.estimated_price) as max_price
FROM product_categories pc
LEFT JOIN transactions t ON pc.id = t.category_id
GROUP BY pc.id, pc.name, pc.description, pc.base_price_range
ORDER BY total_orders DESC;

-- =====================================================
-- 9. PROJECT UPDATES
-- =====================================================

-- Update progress hari ini
SELECT 
    pu.status,
    pu.description,
    pu.updated_by,
    pu.created_at,
    t.description as project_description,
    c.name as customer_name,
    c.phone
FROM project_updates pu
JOIN transactions t ON pu.transaction_id = t.id
JOIN customers c ON t.customer_id = c.id
WHERE DATE(pu.created_at) = CURDATE()
ORDER BY pu.created_at DESC;

-- =====================================================
-- 10. SEARCH DAN FILTER
-- =====================================================

-- Pencarian transaksi berdasarkan keyword
SELECT 
    t.id,
    t.description,
    t.project_status,
    t.estimated_price,
    t.total_paid,
    c.name as customer_name,
    c.phone,
    pc.name as category_name
FROM transactions t
JOIN customers c ON t.customer_id = c.id
JOIN product_categories pc ON t.category_id = pc.id
WHERE 
    t.description ILIKE '%' || $1 || '%' OR
    c.name ILIKE '%' || $1 || '%' OR
    c.phone ILIKE '%' || $1 || '%'
ORDER BY t.created_at DESC;

-- Filter transaksi berdasarkan status dan tanggal
SELECT 
    t.id,
    t.description,
    t.project_status,
    t.estimated_price,
    t.total_paid,
    t.order_date,
    c.name as customer_name,
    c.phone
FROM transactions t
JOIN customers c ON t.customer_id = c.id
WHERE 
    ($1 IS NULL OR t.project_status = $1) AND
    ($2 IS NULL OR DATE(t.order_date) >= $2) AND
    ($3 IS NULL OR DATE(t.order_date) <= $3)
ORDER BY t.order_date DESC;
