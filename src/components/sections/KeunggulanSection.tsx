export default function KeunggulanSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-orange-200/30 to-red-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-float-medium"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="pb-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-orange-600 to-amber-600 mb-6 leading-tight pb-2">
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
            <p className="text-slate-600 text-lg leading-relaxed">Material bersertifikasi, standar SNI, finishing rapi, dan presisi.</p>
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
            <p className="text-slate-600 text-lg leading-relaxed">Tim berpengalaman, timeline jelas, dan tepat waktu.</p>
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
            <p className="text-slate-600 text-lg leading-relaxed">Harga transparan, kompetitif, sesuai kebutuhan dan anggaran Anda.</p>
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
            <p className="text-slate-600 text-lg leading-relaxed">Garansi pengerjaan dan material sesuai ketentuan invoice/kontrak.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
