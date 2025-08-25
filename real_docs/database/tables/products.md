# Tabel: products

## Kolom
- `id SERIAL PK`
- `category_id INTEGER NOT NULL` — FK `product_categories(id)` ON DELETE RESTRICT
- `name VARCHAR(255) NOT NULL`
- `description TEXT`
- `price DECIMAL(15,2)`
- `image_url TEXT`
- `is_active BOOLEAN DEFAULT TRUE`
- `created_at TIMESTAMP DEFAULT NOW()`

## Relasi
- Banyak produk ke satu `product_categories`.

## Catatan
- Opsi: tambah indeks di `category_id` jika query katalog besar.
