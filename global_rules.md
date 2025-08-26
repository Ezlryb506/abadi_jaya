1. Gunakan Bahasa Indonesia dalam percakapan, untuk kode boleh dengan bahasa Inggris
2. Maksimalkan keindahan UI / Kemudahan UX (understandability) dengan menggunakan library yang ada di dependency
3. Maksimalkan Penggunaan Library di Dependency
4. Gunakan Tailwind CSS untuk styling
5. Selalu usahakan menggunakan best practice
6. Selalu Maksimalkan CSS (eg. Animasi, Transisi, Hover, Etc)
7. Selalu buat log/console log informatif ketika membuat/menambah fitur yang perlu backend (bisa dibilang rumit) agar mempermudah debugging, setelah itu minta saya melakukan uji coba, jika uji coba berhasil hapus kode console log nya
8. Selalu gunakan query yang efisien/performance terbaik
9. Selalu terapkan logika kondisional yang dapat mencegah error, misalnya: melebihi batas, null, undefined, dll. (dalam kata lain input / insert validation)
10. jika perintah saya tidak jelas minta saya jelaskan ulang atau jika perintah saya tidak sesuai dengan logika bisnis tolong berikan logika alternatif yang benar
11. Selalu pastikan responsiveness antara mode desktop dan mobile
12. Jangan Lupakan Konfirmation dialog untuk keadaan yang relavan
13. Maksimalkan penggunaan ikon yang relavan
14. Berikan Error Handling yang Robust: Gunakan try-catch, tampilkan error umum untuk pengguna, dan log error detail untuk developer.
15. Terapkan Pagination untuk Endpoint yang Mengembalikan Data Besar: Jangan kembalikan semua data dalam satu response. Gunakan parameter limit, offset, atau page.
16. Hindari alert(), confirm(), atau prompt() Bawaan Browser: Gunakan modal/notification custom untuk UX yang lebih baik dan responsif.
17. Pastikan untuk mengikuti aturan projek, misalnya tsconfig.json: contoh aturan strict, maka ikuti aturan tersebut. contoh: error karena penggunaan any.
18. Implementasi caching strategies yang sesuai dengan kebutuhan data
19. Hindari CSS-in-JS libraries yang tidak support Server Components
20. Hindari penggunaan library yang tidak support Server Components
21. Implementasi authentication patterns yang compatible dengan App Router
22. Gunakan middleware untuk route protection atau yang terkait dengannya
23. Optimalkan teknik rendering untuk SEO
24. Jika saya menyajikan error/warning dari "npm run lint" tolong perbaiki dengan hati-hati (agar tidak merusak projek)
25. Pastikan fitur yang dibuat di lingkungan development juga di optimalkan untuk lingkungan production