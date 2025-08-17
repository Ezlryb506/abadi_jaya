# Struktur Proyek Website Bengkel Las

## Arsitektur Aplikasi

```
Website Bengkel Las Abadi Jaya
├── Frontend (Next.js)
│   ├── Landing Page
│   ├── Katalog Produk
│   ├── Form Pesanan
│   └── Kontak & Alamat
├── Backend (Supabase)
│   ├── Database
│   ├── Authentication
│   ├── Storage
│   └── Real-time
└── Admin Dashboard
    ├── Manajemen Produk
    ├── Manajemen Transaksi
    ├── Tracking Progress
    └── Laporan Keuangan
```

## Struktur Folder Proyek

```
abadi_jaya/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── dashboard/
│   │   ├── admin/
│   │   │   ├── transactions/
│   │   │   ├── customers/
│   │   │   ├── products/
│   │   │   └── reports/
│   │   ├── products/
│   │   │   └── [category]/
│   │   ├── contact/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navigation.tsx
│   │   ├── forms/
│   │   │   ├── OrderForm.tsx
│   │   │   └── ContactForm.tsx
│   │   └── admin/
│   │       ├── TransactionTable.tsx
│   │       ├── CustomerTable.tsx
│   │       └── Dashboard.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── admin.ts
│   │   ├── services/
│   │   │   ├── transactionService.ts
│   │   │   ├── customerService.ts
│   │   │   └── productService.ts
│   │   ├── utils/
│   │   │   ├── format.ts
│   │   │   └── validation.ts
│   │   └── types/
│   │       ├── database.ts
│   │       └── api.ts
│   └── hooks/
│       ├── useTransactions.ts
│       ├── useCustomers.ts
│       └── useProducts.ts
├── public/
│   ├── images/
│   │   ├── products/
│   │   ├── gallery/
│   │   └── logo/
│   └── icons/
├── dokumen/
│   ├── 01_database_schema.sql
│   ├── 02_database_queries.sql
│   ├── 03_supabase_setup.md
│   └── 04_project_structure.md
└── package.json
```

## Komponen Utama

### 1. Landing Page (`src/app/page.tsx`)
- Hero section dengan nama bengkel
- Katalog produk unggulan
- Testimoni customer
- Call-to-action untuk konsultasi

### 2. Katalog Produk (`src/app/products/[category]/page.tsx`)
- Grid produk berdasarkan kategori
- Filter dan pencarian
- Detail produk dengan foto
- Form pesanan cepat

### 3. Form Pesanan (`src/components/forms/OrderForm.tsx`)
- Input data customer
- Pilihan kategori produk
- Deskripsi detail pesanan
- Redirect ke WhatsApp

### 4. Admin Dashboard (`src/app/admin/page.tsx`)
- Overview statistik
- Tabel transaksi
- Update status project
- Input pembayaran

## Database Schema

### Tabel Utama:
1. **`customers`** - Data pelanggan
2. **`product_categories`** - Kategori produk
3. **`transactions`** - Transaksi/pesanan
4. **`payment_history`** - Riwayat pembayaran
5. **`project_updates`** - Update progress proyek

### Relasi:
- Customer → Transactions (1:N)
- Category → Transactions (1:N)
- Transaction → Payment History (1:N)
- Transaction → Project Updates (1:N)

## API Routes

### Public Routes:
- `GET /api/products` - List kategori produk
- `POST /api/orders` - Submit pesanan baru
- `GET /api/contact` - Info kontak bengkel

### Admin Routes:
- `GET /api/admin/transactions` - List transaksi
- `POST /api/admin/transactions` - Create transaksi
- `PUT /api/admin/transactions/[id]` - Update transaksi
- `POST /api/admin/payments` - Input pembayaran
- `PUT /api/admin/progress` - Update progress

## Authentication & Authorization

### Public Access:
- Landing page
- Katalog produk
- Form pesanan
- Kontak & alamat

### Admin Access:
- Dashboard admin
- Manajemen transaksi
- Input pembayaran
- Update progress

## State Management

### Local State:
- Form inputs
- UI components
- Modal states

### Server State:
- Transaksi data
- Customer data
- Product data
- Real-time updates

## Styling & UI

### Framework:
- Tailwind CSS
- Custom components
- Responsive design

### Design System:
- Color palette sesuai brand
- Typography hierarchy
- Component variants
- Animation & transitions

## Performance Optimization

### Frontend:
- Image optimization
- Lazy loading
- Code splitting
- Static generation

### Backend:
- Database indexing
- Query optimization
- Caching strategy
- Real-time subscriptions

## Security

### Data Protection:
- Row Level Security (RLS)
- Input validation
- SQL injection prevention
- File upload restrictions

### Access Control:
- Admin authentication
- API route protection
- Environment variables
- HTTPS enforcement

## Deployment

### Platform:
- Vercel (Frontend)
- Supabase (Backend)

### Environment:
- Development
- Staging
- Production

## Monitoring & Analytics

### Metrics:
- Page views
- Form submissions
- Admin actions
- Error tracking

### Tools:
- Vercel Analytics
- Supabase Dashboard
- Error logging
- Performance monitoring
