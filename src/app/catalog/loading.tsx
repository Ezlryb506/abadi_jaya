export default function LoadingCatalog() {
  // Skeleton untuk halaman katalog saat loading server-side
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Katalog Produk</h1>
          <p className="text-xl text-orange-100">Memuat katalog, mohon tunggu…</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 -mt-10 relative z-10">
        {/* Skeleton untuk filter section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="h-5 w-28 bg-gray-200 rounded mb-2" />
              <div className="h-12 bg-gray-200 rounded-xl" />
            </div>
            <div>
              <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-12 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Skeleton grid produk */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse max-w-sm w-full mx-auto md:max-w-none">
              <div className="m-2 rounded-lg bg-orange-100/60 aspect-[16/9]" />
              <div className="px-5 py-3">
                <div className="h-5 w-24 bg-gray-200 rounded-full mb-3" />
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-4 w-5/6 bg-gray-200 rounded mb-4" />
                <div className="h-7 w-32 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
