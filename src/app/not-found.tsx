import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50 to-amber-50 px-6 py-16">
      <div className="max-w-3xl w-full text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 mb-6">
          <span className="text-lg">⚠️</span>
          <span className="text-sm font-semibold tracking-wide">Halaman tidak ditemukan</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 mb-4 leading-tight">404</h1>
        <p className="text-lg sm:text-xl text-slate-700 leading-relaxed mb-3">
          Maaf, halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
        </p>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
          Periksa kembali ejaan URL, pastikan tidak ada spasi/karakter yang salah. Anda juga bisa kembali ke beranda atau membuka katalog di bawah ini.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-orange-500/25 transform hover:-translate-y-0.5"
          >
            <span>🏠</span>
            <span className="font-semibold">Kembali ke Beranda</span>
          </Link>

          <Link
            href="/catalog"
            className="group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-orange-600 bg-white border-2 border-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-md hover:shadow-orange-500/20 transform hover:-translate-y-0.5"
          >
            <span>🛍️</span>
            <span className="font-semibold">Lihat Katalog</span>
          </Link>
        </div>

        {/* Helper links */}
        <div className="mt-8 text-sm text-slate-500">
          Atau hubungi kami via WhatsApp untuk bantuan cepat.
        </div>
        <div className="mt-3">
          <a
            href="https://wa.me/6289653754317?text=Halo! Saya mengalami 404 saat mengunjungi website Abadi Jaya"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3 bg-green-500 text-white font-semibold hover:bg-green-600 transition shadow-md transform hover:-translate-y-0.5"
          >
            <span>📞</span>
            <span>WhatsApp Kami</span>
          </a>
        </div>

        {/* Quick suggestions */}
        <div className="mt-10 text-sm text-slate-500">
          Mungkin yang Anda maksud:
        </div>
        <ul className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
          <li>
            <Link href="/catalog" className="inline-block px-3 py-1 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition">
              /catalog
            </Link>
          </li>
          <li>
            <Link href="/contact" className="inline-block px-3 py-1 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition">
              /contact
            </Link>
          </li>
          <li>
            <Link href="/testimoni" className="inline-block px-3 py-1 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition">
              /testimoni
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
