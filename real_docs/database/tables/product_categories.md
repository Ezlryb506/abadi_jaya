# Tabel: product_categories

## Kolom
- `id SERIAL PK`
- `name VARCHAR(100) NOT NULL`
- `description TEXT`
- `base_price_range VARCHAR(100)`
- `created_at TIMESTAMP DEFAULT NOW()`

## RLS (saran)
- Biasanya boleh public read untuk katalog (SELECT USING true), namun sesuaikan kebutuhan.
