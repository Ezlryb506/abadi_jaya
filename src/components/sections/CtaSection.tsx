"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CtaSection() {
  return (
    <section
      id="cta"
      aria-labelledby="cta-title"
      className="relative py-24 bg-white overflow-hidden"
      role="region"
    >
      {/* Garis gradient atas */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] h-2 bg-gradient-to-r from-orange-300 via-amber-200 to-orange-300 rounded-full blur-sm opacity-70"
        initial={{ opacity: 0, y: -12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.2 }}
        aria-hidden
      />
      {/* Garis gradient bawah */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vw] h-2 bg-gradient-to-r from-orange-300 via-amber-200 to-orange-300 rounded-full blur-sm opacity-70"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        viewport={{ once: true, amount: 0.2 }}
        aria-hidden
      />
      {/* Watermark Icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ scale: 0.98, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        viewport={{ once: true, amount: 0.2 }}
        aria-hidden
      >
        <span className="text-[16rem] md:text-[22rem] text-orange-100 opacity-20 select-none motion-safe:animate-pulse transition-transform duration-500 group-hover:scale-[1.02]">🛠️</span>
      </motion.div>
      <div className="relative z-10 flex justify-center">
        <motion.div
          className="w-full max-w-3xl bg-white/80 backdrop-blur-xl border border-orange-100 rounded-3xl shadow-2xl px-8 py-16 mx-4 text-center ring-1 ring-orange-100 group transition-shadow duration-300 hover:shadow-[0_20px_60px_-15px_rgba(251,146,60,0.35)]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            id="cta-title"
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 text-transparent bg-clip-text drop-shadow-lg"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            viewport={{ once: true }}
          >
            Siap Memulai Proyek Anda?
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-700 mb-10 font-medium"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            viewport={{ once: true }}
          >
            Konsultasikan kebutuhan pagar, kanopi, railing, dan fabrikasi Anda.
            <span className="block mt-3 text-orange-600 font-semibold">
              Dapatkan estimasi harga cepat dan rekomendasi desain sesuai anggaran.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.08 } }
            }}
          >
            <motion.button
              aria-label="Konsultasi via WhatsApp (respon cepat < 1x24 jam)"
              title="Konsultasi via WhatsApp (respon cepat < 1x24 jam)"
              className="group relative inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-400 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold shadow-xl hover:from-orange-600 hover:to-amber-500 transition-all duration-150 transform will-change-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 cursor-pointer"
              onClick={() => window.open('https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las', '_blank')}
              variants={{ hidden: { y: 10, opacity: 0 }, show: { y: 0, opacity: 1 } }}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'tween', duration: 0.12 }}
            >
              <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none" aria-hidden />
              <span className="flex items-center gap-3">
                <motion.span className="text-2xl sm:text-3xl" aria-hidden animate={{ rotate: [0, 8, -6, 3, 0] }} transition={{ repeat: Infinity, repeatDelay: 3, duration: 1.2 }}>
                  💬
                </motion.span>
                Konsultasi WhatsApp
              </span>
            </motion.button>

            <motion.div variants={{ hidden: { y: 10, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
            <Link
              href="/catalog"
              aria-label="Lihat katalog produk dan jasa"
              title="Lihat Katalog"
              className="group inline-flex items-center bg-white border-2 border-orange-400 text-orange-600 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold shadow hover:bg-orange-50 hover:border-orange-500 hover:text-orange-700 transition-all duration-300 transform motion-safe:hover:scale-[1.03] motion-safe:hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              <span className="flex items-center gap-3">
                <motion.span className="text-2xl sm:text-3xl" aria-hidden whileHover={{ y: -2 }}>
                  🏗️
                </motion.span>
                Lihat Katalog
                <span className="ml-2 text-xl transform transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
              </span>
            </Link>
            </motion.div>
          </motion.div>

          {/* Trust badges */}
          <motion.ul
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm sm:text-base text-gray-600 mb-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
         >
            <motion.li className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full border border-orange-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-orange-100" variants={{ hidden: { y: 8, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
              <span aria-hidden>✅</span>
              20+ Tahun Pengalaman
            </motion.li>
            <motion.li className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full border border-orange-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-orange-100" variants={{ hidden: { y: 8, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
              <span aria-hidden>🏆</span>
              1200+ Proyek Selesai
            </motion.li>
            <motion.li className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full border border-orange-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-orange-100" variants={{ hidden: { y: 8, opacity: 0 }, show: { y: 0, opacity: 1 } }}>
              <span aria-hidden>🛡️</span>
              Garansi Pengerjaan & Material
            </motion.li>
          </motion.ul>

          {/* Sub copy */}
          <motion.div className="mt-2 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}>
            <p className="text-orange-500 text-sm sm:text-base font-medium">
              🚀 Konsultasi gratis • ⚡ Estimasi cepat • 💎 Kualitas premium
            </p>
            <p className="mt-2 text-xs text-gray-500">Tidak ada biaya tersembunyi. Data Anda aman bersama kami.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
