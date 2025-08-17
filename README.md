# Website Bengkel Las Abadi Jaya

Website resmi untuk Bengkel Las Abadi Jaya yang menyediakan layanan pembuatan produk besi dan stainless steel custom.

## 🚀 Fitur Utama

- **Landing Page** - Presentasi bengkel dan layanan
- **Katalog Produk** - Kategori produk dengan foto dan deskripsi
- **Form Pesanan** - Sistem pemesanan online dengan redirect WhatsApp
- **Admin Dashboard** - Manajemen transaksi, customer, dan tracking progress
- **Tracking Progress** - Monitoring status pengerjaan proyek real-time

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Storage)
- **Deployment**: Vercel
- **Version Control**: Git

## 📋 Kategori Produk

- Pagar (Besi, Stainless, Minimalis)
- Kanopi (Carport, Teras, Garasi)
- Railing Tangga
- Pintu Besi
- Jendela
- Teralis
- Tangga Putar
- Produk Minimalis
- Produk Stainless Premium

## 🗄️ Database Schema

### Tabel Utama:
- `customers` - Data pelanggan
- `product_categories` - Kategori produk
- `transactions` - Transaksi/pesanan
- `payment_history` - Riwayat pembayaran
- `project_updates` - Update progress proyek

## 🚦 Status Proyek

- [x] Setup proyek Next.js
- [x] Install Supabase
- [x] Setup database schema
- [x] Setup Git repository
- [ ] Konfigurasi environment variables
- [ ] Setup Supabase project
- [ ] Implementasi UI components
- [ ] Landing page
- [ ] Katalog produk
- [ ] Form pesanan
- [ ] Admin dashboard

## 📁 Struktur Proyek

```
abadi_jaya/
├── src/
│   ├── app/           # Next.js app router
│   ├── components/    # React components
│   ├── lib/          # Utilities & services
│   └── hooks/        # Custom hooks
├── public/            # Static assets
├── dokumen/          # Dokumentasi proyek
└── package.json
```

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Akun Supabase

### Installation
```bash
# Clone repository
git clone <repository-url>
cd abadi_jaya

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan credentials Supabase

# Run development server
npm run dev
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📚 Dokumentasi

- [Database Schema](dokumen/01_database_schema.sql)
- [Database Queries](dokumen/02_database_queries.sql)
- [Supabase Setup](dokumen/03_supabase_setup.md)
- [Project Structure](dokumen/04_project_structure.md)
- [Development Roadmap](dokumen/05_development_roadmap.md)

## 🔧 Development

### Git Workflow
```bash
# Buat branch baru untuk fitur
git checkout -b feature/nama-fitur

# Commit perubahan
git add .
git commit -m "feat: tambah fitur nama-fitur"

# Push ke remote
git push origin feature/nama-fitur

# Merge ke main setelah review
git checkout main
git merge feature/nama-fitur
```

### Commit Convention
- `feat:` - Fitur baru
- `fix:` - Bug fix
- `docs:` - Dokumentasi
- `style:` - Formatting, styling
- `refactor:` - Refactoring code
- `test:` - Testing
- `chore:` - Maintenance

## 📱 Screenshots

*Screenshots akan ditambahkan setelah implementasi UI*

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Kontak

**Bengkel Las Abadi Jaya**
- Website: [URL Website]
- WhatsApp: [Nomor WhatsApp]
- Email: [Email]
- Alamat: [Alamat Bengkel]

## 🙏 Acknowledgments

- Next.js team untuk framework yang luar biasa
- Supabase team untuk backend service
- Tailwind CSS untuk styling framework
- Komunitas developer Indonesia

---

**Dibuat dengan ❤️ untuk Bengkel Las Abadi Jaya**
