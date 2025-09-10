'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section id="beranda" className="relative h-[calc(100svh-4.5rem)] md:h-[calc(100vh-4.5rem)] md:flex md:items-center md:justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-4 md:pt-0 bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 md:bg-none">
      {/* Enhanced Background Pattern dengan Multiple Layers */}
      <div className="absolute inset-0 hidden md:block">
        {/* Primary Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50"></div>
        
        {/* Animated Floating Elements */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-float-medium"></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-float-fast"></div>
        
        {/* Geometric Patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-300/10 to-yellow-300/10 transform rotate-45 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-300/10 to-cyan-300/10 transform -rotate-12 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto text-center relative z-10">
        {/* Hero Title dengan Enhanced Typography */}
        <div className="mb-8 md:mb-12 animate-fade-in-up">
          {/* Mobile-optimized Title (LCP) */}
          <h1 className="block md:hidden text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mt-4 mb-6">
            Bengkel Las Abadi Jaya
          </h1>
          <div className="mb-6 hidden md:block">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-orange-600 to-amber-600 mb-4 leading-tight pb-2">
              Bengkel Las
            </h1>
            <div className="relative pb-4"> {/* Added padding-bottom for Y */}
              <h2 className="text-6xl md:text-8xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 leading-tight pb-2"> {/* Changed from leading-none to leading-tight and added pb-2 */}
                Abadi Jaya
              </h2>
              {/* Glow Effect */}
              <div className="absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-black text-orange-500/20 blur-xl -z-10 leading-tight pb-2"> {/* Added same line-height and padding */}
                Abadi Jaya
              </div>
            </div>
          </div>
          
          <p className="text-base sm:text-lg md:text-2xl text-slate-600 leading-relaxed font-medium max-w-prose md:max-w-3xl mx-auto mb-10 ">
            Wujudkan pagar, kanopi, atau railing impian Anda bersama kami. Kami ahli las di Bekasi dengan pengerjaan yang presisi dan material berkualitas.
            <span className="block mt-1 sm:mt-2 text-orange-600 font-semibold">
              Konsultasi gratis dan santai via WhatsApp. Kami akan bantu dari desain hingga pemasangan, dijamin rapi, kuat, dan awet.
            </span>
          </p>
        </div>
        
        {/* Enhanced CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up animation-delay-200 mb-6 md:mb-16">
          <button 
            className="group relative bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:from-orange-600 hover:via-red-600 hover:to-amber-600 transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 shadow-2xl hover:shadow-orange-500/25 overflow-hidden cursor-pointer mb-6"
            onClick={() => window.open('https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las', '_blank')}
          >
            {/* Button Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-red-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <span className="relative flex items-center gap-3">
              <span className="text-2xl">📞</span>
              Konsultasi Gratis via WhatsApp
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          
          <Link 
            href="/catalog"
            className="group relative border-2 border-orange-500 text-orange-600 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-orange-500 hover:text-white transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 shadow-xl hover:shadow-orange-500/25 bg-white/80 backdrop-blur-sm mb-6"
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">🏗️</span>
              Lihat Katalog
              <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0l-7-7m7 7l-7 7" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Enhanced Stats dengan Animasi */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 animate-fade-in-up animation-delay-400">
          <div className="group text-center transform hover:scale-110 transition-all duration-500">
            <div className="relative">
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mb-3 group-hover:from-orange-600 group-hover:to-red-600 transition-all duration-500">
                1200+
              </div>
              <div className="absolute inset-0 text-4xl md:text-5xl font-black text-orange-500/20 blur-lg -z-10 group-hover:blur-xl transition-all duration-500">
                1200+
              </div>
            </div>
            <div className="text-slate-600 font-semibold text-lg">Proyek Selesai</div>
            <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto mt-3 rounded-full group-hover:w-20 transition-all duration-500"></div>
          </div>
          
          <div className="group text-center transform hover:scale-110 transition-all duration-500">
            <div className="relative">
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 mb-3 group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-500">
                20+
              </div>
              <div className="absolute inset-0 text-4xl md:text-5xl font-black text-blue-500/20 blur-lg -z-10 group-hover:blur-xl transition-all duration-500">
                20+
              </div>
            </div>
            <div className="text-slate-600 font-semibold text-lg">Tahun Pengalaman</div>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mt-3 rounded-full group-hover:w-20 transition-all duration-500"></div>
          </div>
          
          <div className="group text-center transform hover:scale-110 transition-all duration-500 col-span-2 md:col-span-1 mx-auto md:mx-0">
            <div className="relative">
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-500 mb-3 group-hover:from-green-600 group-hover:to-emerald-600 transition-all duration-500">
                96%
              </div>
              <div className="absolute inset-0 text-4xl md:text-5xl font-black text-green-500/20 blur-lg -z-10 group-hover:blur-xl transition-all duration-500">
                96%
              </div>
            </div>
            <div className="text-slate-600 font-semibold text-lg">Pelanggan Puas</div>
            <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mt-3 rounded-full group-hover:w-20 transition-all duration-500"></div>
          </div>
        </div>

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-50 animate-bounce">
          <button 
            className="group w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-110 cursor-pointer"
            onClick={() => window.open('https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las', '_blank')}
          >
            <span className="text-3xl" aria-hidden>💬</span>
            <span className="sr-only">Konsultasi via WhatsApp</span>
          </button>
        </div>
      </div>
    </section>
  );
}
