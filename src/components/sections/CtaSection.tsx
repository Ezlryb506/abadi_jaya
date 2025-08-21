import Link from 'next/link';

export default function CtaSection() {
  return (
    <section
      id="cta"
      aria-labelledby="cta-title"
      className="relative py-24 bg-white overflow-hidden"
      role="region"
    >
      {/* Garis gradient atas */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] h-2 bg-gradient-to-r from-orange-300 via-amber-200 to-orange-300 rounded-full blur-sm opacity-70"></div>
      {/* Garis gradient bawah */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vw] h-2 bg-gradient-to-r from-orange-300 via-amber-200 to-orange-300 rounded-full blur-sm opacity-70"></div>
      {/* Watermark Icon */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[16rem] md:text-[22rem] text-orange-100 opacity-20 select-none">🛠️</span>
      </div>
      <div className="relative z-10 flex justify-center">
        <div className="w-full max-w-3xl bg-white/80 backdrop-blur-xl border border-orange-100 rounded-3xl shadow-2xl px-8 py-16 mx-4 text-center ring-1 ring-orange-100">
          <h2 id="cta-title" className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 text-transparent bg-clip-text drop-shadow-lg">
            Siap Memulai Proyek Anda?
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-10 font-medium">
            Konsultasikan kebutuhan las dan fabrikasi Anda dengan tim ahli kami.
            <span className="block mt-3 text-orange-600 font-semibold">
              Dapatkan estimasi harga & desain sesuai budget dan visi Anda.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8">
            <button
              aria-label="Konsultasi via WhatsApp"
              title="Konsultasi via WhatsApp"
              className="group relative inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-400 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold shadow-xl hover:from-orange-600 hover:to-amber-500 transition-all duration-300 transform motion-safe:hover:scale-[1.03] motion-safe:hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 cursor-pointer"
              onClick={() => window.open('https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las', '_blank')}
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl" aria-hidden>💬</span>
                Konsultasi WhatsApp
              </span>
            </button>

            <Link
              href="/catalog"
              aria-label="Lihat katalog produk dan jasa"
              title="Lihat Katalog"
              className="group inline-flex items-center bg-white border-2 border-orange-400 text-orange-600 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold shadow hover:bg-orange-50 hover:border-orange-500 hover:text-orange-700 transition-all duration-300 transform motion-safe:hover:scale-[1.03] motion-safe:hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl" aria-hidden>🏗️</span>
                Lihat Katalog
              </span>
            </Link>
          </div>

          {/* Trust badges */}
          <ul className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm sm:text-base text-gray-600 mb-6">
            <li className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full border border-orange-100">
              <span aria-hidden>✅</span>
              20+ Tahun Pengalaman
            </li>
            <li className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full border border-orange-100">
              <span aria-hidden>🏆</span>
              1200+ Proyek Selesai
            </li>
            <li className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full border border-orange-100">
              <span aria-hidden>🛡️</span>
              Garansi Pengerjaan
            </li>
          </ul>

          {/* Sub copy */}
          <div className="mt-2 text-center">
            <p className="text-orange-500 text-sm sm:text-base font-medium">
              🚀 Konsultasi GRATIS • ⚡ Estimasi CEPAT • 💎 Kualitas PREMIUM
            </p>
            <p className="mt-2 text-xs text-gray-500">Tidak ada biaya tersembunyi. Data Anda aman bersama kami.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
