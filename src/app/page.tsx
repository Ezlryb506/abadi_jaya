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
      <section className="py-24 bg-gradient-to-br from-orange-500 via-red-500 to-amber-500 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-float-medium"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pb-4"> {/* Added padding-bottom for descender characters */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 leading-tight pb-2"> {/* Added pb-2 for descender characters */}
              Siap Memulai Proyek Anda?
            </h2>
          </div>
          <p className="text-xl md:text-2xl text-orange-100 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
            Konsultasikan kebutuhan las dan fabrikasi Anda dengan tim ahli kami. 
            <span className="block mt-3 text-white font-semibold">
              Dapatkan estimasi harga dan desain yang sesuai dengan budget dan visi Anda.
            </span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <button 
              className="group relative bg-white text-orange-600 px-12 py-6 rounded-2xl text-xl font-bold hover:bg-gray-50 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 shadow-2xl hover:shadow-white/25 overflow-hidden"
              onClick={() => window.open('https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las', '_blank')}
            >
              {/* Button Background Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <span className="relative flex items-center gap-4">
                <span className="text-3xl">📱</span>
                Konsultasi via WhatsApp
                <svg className="w-7 h-7 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            
            <button className="group relative border-3 border-white text-white px-12 py-6 rounded-2xl text-xl font-bold hover:bg-white hover:text-orange-600 transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 shadow-xl hover:shadow-white/25 bg-transparent backdrop-blur-sm">
              <span className="relative flex items-center gap-4">
                <span className="text-3xl">📞</span>
                Telepon Langsung
                <svg className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </span>
            </button>
          </div>

          {/* Lihat Katalog Button */}
          <div className="mb-8">
            <Link
              href="/catalog"
              className="group inline-flex items-center gap-4 bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border border-white/30 hover:border-white/50"
            >
              <span className="text-2xl">🏗️</span>
              Lihat Katalog Produk Lengkap
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0l-7-7m7 7l-7 7" />
              </svg>
            </Link>
          </div>
          
          {/* Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-orange-100 text-lg font-medium">
              🚀 Konsultasi GRATIS • ⚡ Estimasi CEPAT • 💎 Kualitas PREMIUM
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
