'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HowToSection() {
  const steps: { title: string; desc: string; icon: string; cta?: { label: string; href: string } }[] = [
    {
      title: 'Pilih Layanan / Katalog',
      desc: 'Jelajahi katalog untuk melihat contoh produk dan range harga sebagai gambaran awal.',
      icon: '🗂️',
      cta: { label: 'Lihat Katalog', href: '/catalog' },
    },
    {
      title: 'Konsultasi Cepat',
      desc: 'Ceritakan kebutuhan Anda via WhatsApp. Kami bantu rekomendasi desain, material, dan estimasi.',
      icon: '💬',
      cta: { label: 'Konsultasi WhatsApp', href: 'https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las' },
    },
    {
      title: 'Daftar Akun Customer',
      desc: 'Buat akun agar proses transaksi lebih mudah dan data Anda tersimpan rapi.',
      icon: '📝',
      cta: { label: 'Daftar', href: '/login?tab=customer&mode=register' },
    },
    {
      title: 'Masuk & Lengkapi Alamat',
      desc: 'Masuk ke dashboard lalu lengkapi alamat untuk mempermudah pengiriman & penawaran.',
      icon: '🔑',
      cta: { label: 'Masuk', href: '/login?tab=customer&mode=login' },
    },
    {
      title: 'Survei & Estimasi Detail',
      desc: 'Jika diperlukan, kami jadwalkan survei lokasi untuk pengukuran dan validasi kebutuhan.',
      icon: '📍',
    },
    {
      title: 'Penawaran & DP',
      desc: 'Kami kirimkan penawaran resmi. Produksi dimulai setelah DP disepakati.',
      icon: '🧾',
    },
    {
      title: 'Produksi & QC',
      desc: 'Tim kami memproduksi sesuai spesifikasi. Quality Check dilakukan sebelum pemasangan.',
      icon: '🏭',
    },
    {
      title: 'Instalasi & Garansi',
      desc: 'Pemasangan di lokasi Anda, serah terima, pelunasan, dan garansi sesuai ketentuan.',
      icon: '🛡️',
    },
    {
      title: 'Pantau Dashboard',
      desc: 'Lihat status proyek, update progres, dan histori pembayaran di dashboard Anda.',
      icon: '📊',
      cta: { label: 'Buka Dashboard', href: '/user-dashboard' },
    },
  ];

  return (
    <section id="alur" aria-labelledby="howto-title" className="relative py-24 bg-gradient-to-b from-white to-orange-50/60 overflow-hidden">
      {/* Accent lines */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-orange-100/60 to-transparent"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        aria-hidden
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            id="howto-title"
            className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            Cara Menggunakan Aplikasi & Alur Transaksi
          </motion.h2>
          <motion.p
            className="mt-3 text-slate-600 text-lg"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
            viewport={{ once: true }}
          >
            Ikuti langkah-langkah sederhana berikut untuk mewujudkan proyek Anda.
          </motion.p>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
            <motion.li
              key={s.title}
              className="relative group rounded-2xl border border-orange-100 bg-white/80 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: idx * 0.03 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 border border-orange-100 text-2xl">
                  <span aria-hidden>{s.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    <span className="mr-1 text-orange-500">{String(idx + 1).padStart(2, '0')}.</span>
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-slate-600 text-sm leading-relaxed">{s.desc}</p>

                  {s.cta ? (
                    <div className="mt-3">
                      {s.cta.href.startsWith('http') ? (
                        <a
                          href={s.cta.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
                        >
                          <span aria-hidden>↗</span> {s.cta.label}
                        </a>
                      ) : (
                        <Link
                          href={s.cta.href}
                          className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
                        >
                          <span aria-hidden>→</span> {s.cta.label}
                        </Link>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
        
      </div>
    </section>
  );
}

