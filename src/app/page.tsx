'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

// Lazy load components untuk performance yang lebih baik
const HeroSection = dynamic(() => import('@/components/sections/HeroSection'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: true
});

const LayananSection = dynamic(() => import('@/components/sections/LayananSection'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: true
});

export default function Home() {
  return (
    <>
      <HeroSection />
      <LayananSection />
      
      {/* Enhanced Keunggulan Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-orange-200/30 to-red-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-float-medium"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="pb-4"> {/* Added padding-bottom for descender characters */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-orange-600 to-amber-600 mb-6 leading-tight pb-2"> {/* Changed from leading-relaxed to leading-tight and added pb-2 */}
                Mengapa Memilih Kami?
              </h2>
            </div>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Keunggulan yang membuat Abadi Jaya menjadi pilihan terbaik untuk kebutuhan las Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center transform hover:scale-110 transition-all duration-500">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto group-hover:from-orange-600 group-hover:via-red-600 group-hover:to-amber-600 transition-all duration-500 shadow-xl group-hover:shadow-2xl">
                  <span className="text-4xl text-white">⭐</span>
                </div>
                {/* Glow Effect */}
                <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-amber-500/20 rounded-2xl blur-xl -z-10 group-hover:blur-2xl transition-all duration-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-orange-600 transition-colors duration-300">Kualitas Terjamin</h3>
              <p className="text-slate-600 text-lg leading-relaxed">Material berkualitas tinggi dengan standar SNI dan pengerjaan presisi</p>
            </div>

            <div className="group text-center transform hover:scale-110 transition-all duration-500">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto group-hover:from-blue-600 group-hover:via-cyan-600 group-hover:to-teal-600 transition-all duration-500 shadow-xl group-hover:shadow-2xl">
                  <span className="text-4xl text-white">⚡</span>
                </div>
                {/* Glow Effect */}
                <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-2xl blur-xl -z-10 group-hover:blur-2xl transition-all duration-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors duration-300">Pengerjaan Cepat</h3>
              <p className="text-slate-600 text-lg leading-relaxed">Tim berpengalaman dengan pengerjaan tepat waktu dan efisien</p>
            </div>

            <div className="group text-center transform hover:scale-110 transition-all duration-500">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto group-hover:from-green-600 group-hover:via-emerald-600 group-hover:to-teal-600 transition-all duration-500 shadow-xl group-hover:shadow-2xl">
                  <span className="text-4xl text-white">💰</span>
                </div>
                {/* Glow Effect */}
                <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl -z-10 group-hover:blur-2xl transition-all duration-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-green-600 transition-colors duration-300">Harga Terjangkau</h3>
              <p className="text-slate-600 text-lg leading-relaxed">Harga kompetitif dengan kualitas terbaik dan transparan</p>
            </div>

            <div className="group text-center transform hover:scale-110 transition-all duration-500">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto group-hover:from-purple-600 group-hover:via-pink-600 group-hover:to-rose-600 transition-all duration-500 shadow-xl group-hover:shadow-2xl">
                  <span className="text-4xl text-white">🛠️</span>
                </div>
                {/* Glow Effect */}
                <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-rose-500/20 rounded-2xl blur-xl -z-10 group-hover:blur-2xl transition-all duration-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-purple-600 transition-colors duration-300">Garansi Lengkap</h3>
              <p className="text-slate-600 text-lg leading-relaxed">Garansi pengerjaan dan material dengan layanan purna jual</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-24 bg-white overflow-hidden">
        {/* Garis gradient atas */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] h-2 bg-gradient-to-r from-orange-300 via-amber-200 to-orange-300 rounded-full blur-sm opacity-70"></div>
        {/* Garis gradient bawah */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vw] h-2 bg-gradient-to-r from-orange-300 via-amber-200 to-orange-300 rounded-full blur-sm opacity-70"></div>
        {/* Watermark Icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[16rem] md:text-[22rem] text-orange-100 opacity-20 select-none">🛠️</span>
        </div>
        <div className="relative z-10 flex justify-center">
          <div className="w-full max-w-3xl bg-white/80 backdrop-blur-xl border border-orange-100 rounded-3xl shadow-2xl px-8 py-16 mx-4 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 text-transparent bg-clip-text drop-shadow-lg">
              Siap Memulai Proyek Anda?
            </h2>
            <p className="text-lg md:text-xl text-gray-700 mb-10 font-medium">
              Konsultasikan kebutuhan las dan fabrikasi Anda dengan tim ahli kami.<br />
              <span className="block mt-3 text-orange-600 font-semibold">
                Dapatkan estimasi harga & desain sesuai budget dan visi Anda.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <button
                className="group relative bg-gradient-to-r from-orange-500 to-amber-400 text-white px-10 py-5 rounded-2xl text-xl font-bold shadow-xl hover:from-orange-600 hover:to-amber-500 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 cursor-pointer"
                onClick={() => window.open('https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las', '_blank')}
              >
                <span className="flex items-center gap-3">
                  <span className="text-3xl">💬</span>
                  Konsultasi WhatsApp
                </span>
              </button>
              <Link
                href="/catalog"
                className="group bg-white border-2 border-orange-400 text-orange-600 px-10 py-5 rounded-2xl text-xl font-bold shadow hover:bg-orange-50 hover:border-orange-500 hover:text-orange-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
              >
                <span className="flex items-center gap-3">
                  <span className="text-3xl">🏗️</span>
                  Lihat Katalog
                </span>
              </Link>
            </div>
            <div className="mt-8 text-center">
              <p className="text-orange-500 text-lg font-medium">
                🚀 Konsultasi GRATIS • ⚡ Estimasi CEPAT • 💎 Kualitas PREMIUM
              </p>
            </div>
        </div>
    </div>
      </section>
    </>
  );
}
