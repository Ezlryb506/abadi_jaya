'use client';

export default function HeroSection() {
  return (
    <section id="beranda" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Bengkel Las
            <span className="text-orange-500 block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Abadi Jaya
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Spesialis jasa las dan fabrikasi besi berkualitas tinggi. 
            Dari pagar minimalis hingga kanopi stainless, kami siap mewujudkan ide Anda menjadi kenyataan.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-200">
          <button 
            className="group bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
            onClick={() => window.open('https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las', '_blank')}
          >
            <span className="flex items-center gap-2">
              📞 Hubungi Kami
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
          <button className="border-2 border-orange-500 text-orange-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105">
            🏗️ Lihat Katalog
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up animation-delay-400">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">500+</div>
            <div className="text-gray-600">Proyek Selesai</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">5+</div>
            <div className="text-gray-600">Tahun Pengalaman</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">98%</div>
            <div className="text-gray-600">Customer Puas</div>
          </div>
        </div>
      </div>
    </section>
  );
}
