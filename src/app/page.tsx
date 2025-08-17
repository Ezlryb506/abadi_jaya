'use client';

import dynamic from 'next/dynamic';

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
      
      {/* Keunggulan Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Keunggulan yang membuat Abadi Jaya menjadi pilihan terbaik untuk kebutuhan las Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Kualitas Terjamin</h3>
              <p className="text-gray-600">Material berkualitas tinggi dengan standar SNI</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Pengerjaan Cepat</h3>
              <p className="text-gray-600">Tim berpengalaman dengan pengerjaan tepat waktu</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Harga Terjangkau</h3>
              <p className="text-gray-600">Harga kompetitif dengan kualitas terbaik</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white">🛠️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Garansi Lengkap</h3>
              <p className="text-gray-600">Garansi pengerjaan dan material</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Siap Memulai Proyek Anda?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Konsultasikan kebutuhan las dan fabrikasi Anda dengan tim ahli kami. 
            Dapatkan estimasi harga dan desain yang sesuai dengan budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="group bg-white text-orange-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
              onClick={() => window.open('https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las', '_blank')}
            >
              <span className="flex items-center gap-2">
                📱 Konsultasi via WhatsApp
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-orange-500 transition-all transform hover:scale-105">
              📞 Telepon Langsung
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
