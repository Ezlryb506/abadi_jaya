use only existing project dependencies; do not add new packages; prefer built-ins
deps: next, react, react-dom, @supabase/supabase-js, @headlessui/react, framer-motion, tailwindcss, @tailwindcss/postcss
style: TypeScript, Next.js App Router, Server Components by default
constraints:
- data/auth: @supabase/supabase-js
- UI: tailwindcss + @headlessui/react
- animation: framer-motion
- routing/SEO: next/app router + metadata
- images: next/image
- fetch: native fetch (no axios)
- state: React state (no Zustand/Redux)
- forms: native/react only (no Formik/React Hook Form/Zod)

aturan lainnya:
- Maksimalkan penggunaan library yang ada
- UI/UX harus sesuai dengan kebutuhan pengguna
- Animasi harus sesuai dengan kebutuhan pengguna
- Selalu gunakan @docs: yang relavan untuk menyelesaikan problem
- Selalu perhatikan konsistensi UI/UX, misal pada Card yang memiliki kemungkinan perbedaan letak tombol card 1 dengan card lainnya (secara horizontal), biasanya ini disebabkan karena perbedaan tinggi konten setiap card