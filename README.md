# Bengkel Las Abadi Jaya - Website & Sistem Manajemen

Ini adalah repositori untuk aplikasi web fullstack "Bengkel Las Abadi Jaya", sebuah platform digital yang dirancang untuk membawa bisnis bengkel las tradisional ke era modern. Proyek ini bukan sekadar landing page, melainkan sebuah sistem yang komprehensif dengan katalog produk, dashboard admin, dan portal pelanggan.

**Live Demo:** [https://abadi-jaya.vercel.app/](https://abadi-jaya.vercel.app/)

---

## Latar Belakang Proyek (The "Why")

Bengkel las tradisional sering kali mengandalkan promosi dari mulut ke mulut dan manajemen pesanan manual, yang membatasi jangkauan pasar dan efisiensi operasional. Proyek "Abadi Jaya" dibangun untuk menyelesaikan masalah ini dengan menyediakan solusi digital yang mencakup:

* **Visibilitas Online:** Membuat etalase digital melalui landing page dan katalog produk yang SEO-friendly.
* **Manajemen Terpusat:** Menyediakan dashboard admin untuk mengelola produk, pesanan, dan ulasan pelanggan.
* **Pengalaman Pelanggan Modern:** Memberikan portal bagi pelanggan untuk melacak progres pesanan mereka.

## Solusi & Arsitektur Teknologi (The "How")

Untuk mencapai tujuan tersebut, saya memilih *tech stack* yang modern, performan, dan skalabel:

* **Framework:** **Next.js (App Router)**
    * Dipilih untuk performa SEO yang superior melalui Server-Side Rendering (SSR) dan Server Components, serta kemudahan dalam membangun UI yang interaktif dan cepat dengan arsitektur React terbaru.

* **Backend & Database:** **Supabase**
    * Dipilih sebagai solusi Backend-as-a-Service (BaaS) yang *all-in-one*. Supabase menyediakan database PostgreSQL, sistem otentikasi, *storage* untuk file, dan yang terpenting, fitur **Row Level Security (RLS)** untuk keamanan data yang robust di level database.

* **Styling:** **Tailwind CSS**
    * Dipilih untuk pengembangan UI yang cepat dan konsisten dengan pendekatan *utility-first*.

* **Deployment:** **Vercel**
    * Dipilih karena integrasi *zero-configuration* dengan Next.js, menyediakan CI/CD otomatis, *preview deployments* untuk setiap *pull request*, dan performa global melalui Edge Network.

---

## Fitur Unggulan (The "What")

Proyek ini memiliki beberapa fitur kunci yang menunjukkan kedalaman teknis dan pemahaman bisnis:

### 1. Dashboard Admin yang Komprehensif
Dashboard admin adalah pusat kendali bisnis, memungkinkan admin untuk:
* **Manajemen Produk (CRUD):** Menambah, melihat, mengedit, dan menghapus produk di katalog.
* **Manajemen Pesanan:** Melacak semua transaksi pelanggan, memperbarui status progres proyek (dari "Survey" hingga "Completed"), dan melihat riwayat pembayaran.
* **Moderasi Ulasan:** Menyetujui atau menyembunyikan ulasan pelanggan sebelum ditampilkan di halaman testimoni publik.

### 2. Integrasi AI (Gemini) untuk Efisiensi
Untuk mempercepat proses input data, form produk di dashboard admin dilengkapi fitur "Bantu Isi Otomatis".
* **Implementasi:** Sebuah API Route di Next.js (`/api/ai/product-suggest`) memanggil model AI Google Gemini untuk memberikan saran nama produk, deskripsi, dan tag yang relevan berdasarkan input minimal dari admin. API ini juga dilengkapi dengan *rate limiting* untuk mencegah penyalahgunaan.

### 3. Keamanan Tingkat Lanjut
Keamanan data adalah prioritas utama, diimplementasikan melalui beberapa lapisan:
* **Otorisasi Berbasis Database (RLS):** Kebijakan Row Level Security (RLS) di Supabase memastikan bahwa seorang pengguna HANYA dapat mengakses datanya sendiri, dan hanya admin yang dapat mengakses semua data. Aturan ini ditegakkan di level database, memberikan lapisan keamanan yang sangat kuat.
* **Pengecekan Keamanan Password:** Saat registrasi, password pengguna diperiksa melalui API *Have I Been Pwned* (HIBP) untuk memastikan tidak menggunakan password yang telah bocor.

### 4. SEO & Performa Modern
Website ini dibangun dari dasar dengan mempertimbangkan SEO dan performa:
* **Metadata Dinamis:** Setiap halaman produk dan katalog secara otomatis menghasilkan `meta title` dan `meta description` yang unik dan relevan/page.tsx].
* **Structured Data (JSON-LD):** Mengimplementasikan skema `LocalBusiness`, `FAQPage`, dan `Product` untuk membantu Google memahami konten dan meningkatkan peluang munculnya *rich snippets*.
* **Sitemap Otomatis:** `sitemap.xml` dihasilkan secara dinamis saat *build*, mencakup semua halaman statis dan halaman produk dari database.

---

## Menjalankan Proyek Secara Lokal

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/ezlryb506/abadi-jaya.git](https://github.com/ezlryb506/abadi-jaya.git)
    cd abadi-jaya
    ```

2.  **Install dependensi:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    * Buat file `.env.local` di root proyek.
    * Salin isi dari `.env.example` (jika ada) atau tambahkan variabel yang diperlukan, terutama `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

4.  **Jalankan server development:**
    ```bash
    npm run dev
    ```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.
```eof
