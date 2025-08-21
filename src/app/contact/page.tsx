'use client';

import { useState } from 'react';

export default function ContactPage() {
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Fungsi untuk mendapatkan lokasi pengguna
  const getUserLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolokasi tidak didukung di browser ini');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLoadingLocation(false);
        
        // Otomatis buka Google Maps dengan rute dari lokasi pengguna
        openRouteFromUserLocation(latitude, longitude);
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Akses lokasi ditolak. Silakan izinkan akses lokasi di browser Anda.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Informasi lokasi tidak tersedia');
            break;
          case error.TIMEOUT:
            setLocationError('Waktu permintaan lokasi habis');
            break;
          default:
            setLocationError('Terjadi kesalahan saat mendapatkan lokasi');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Fungsi untuk membuka rute dari lokasi pengguna ke bengkel
  const openRouteFromUserLocation = (userLat: number, userLng: number) => {
    // Koordinat bengkel las Abadi Jaya
    const bengkelLat = -6.254683;
    const bengkelLng = 107.085045;
    
    // URL Google Maps dengan rute dari lokasi pengguna ke bengkel
    const routeUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${bengkelLat},${bengkelLng}`;
    window.open(routeUrl, '_blank');
  };

  // Fungsi untuk membuka Google Maps dengan alamat bengkel
  const openGoogleMaps = () => {
    const address = "Gg. Bunga, Wanasari, Kec. Cibitung, Kabupaten Bekasi, Jawa Barat 17520";
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
  };

  // Fungsi untuk membuka link Google Maps yang sudah disediakan
  const openBengkelLocation = () => {
    window.open('https://maps.app.goo.gl/B8xNUCjmEC7kEpaS8', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Hubungi Kami
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Siap membantu mewujudkan proyek las dan fabrikasi besi impian Anda.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Info Cards - Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Phone Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📞</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Telepon & WhatsApp</h3>
                  <a
                    href="https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-700 font-medium text-lg"
                  >
                    0896-5375-4317
                  </a>
                </div>
              </div>
            </div>

            {/* Enhanced Address Card dengan Smart Route Finding */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📍</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Alamat</h3>
                  <p className="text-gray-600">Gg. Bunga, Wanasari, Kec. Cibitung, Kabupaten Bekasi, Jawa Barat 17520</p>
                </div>
              </div>
              
              {/* Smart Route Finding Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Pencarian Rute Cerdas:</h4>
                
                {/* Auto Route Button */}
                <button
                  onClick={getUserLocation}
                  disabled={isLoadingLocation}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-lg ${
                    isLoadingLocation
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                  }`}
                >
                  {isLoadingLocation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Mendeteksi Lokasi...
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🚀</span>
                      Rute Otomatis dari Lokasi Saya
                    </>
                  )}
                </button>

                {/* Location Status */}
                {userLocation && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                    <p className="text-green-700 text-sm font-medium">✅ Lokasi terdeteksi!</p>
                    <p className="text-green-600 text-xs">Rute sedang dibuka di Google Maps</p>
                  </div>
                )}

                {locationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <p className="text-red-700 text-sm font-medium">❌ {locationError}</p>
                  </div>
                )}

                {/* Manual Route Options */}
                <div className="pt-2 border-t border-gray-200">
                  <h5 className="text-xs font-medium text-gray-600 mb-2">Atau pilih platform:</h5>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={openBengkelLocation}
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <span className="text-lg">📍</span>
                      Lihat Lokasi Bengkel
                    </button>
                    <button
                      onClick={openGoogleMaps}
                      className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <span className="text-lg">🗺️</span>
                      Google Maps
                    </button>
                    
                  </div>
                </div>
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🕒</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Jam Operasional</h3>
                  <p className="text-gray-600">Senin - Sabtu</p>
                  <p className="text-gray-600 font-medium">08:00 - 17:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form & Map - Right Side */}
          <div className="lg:col-span-2 space-y-8">

            {/* Enhanced Map Card dengan Smart Route Finding */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Lokasi Bengkel</h3>
                    <p className="text-gray-600 text-sm">Gg. Bunga, Wanasari, Kec. Cibitung, Kabupaten Bekasi, Jawa Barat 17520</p>
                  </div>
                  
                  {/* Smart Route Finding Button */}
                  <div className="flex gap-2">
                    <button
                      onClick={getUserLocation}
                      disabled={isLoadingLocation}
                      className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-lg ${
                        isLoadingLocation
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                      }`}
                    >
                      {isLoadingLocation ? (
                        <>
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          Deteksi...
                        </>
                      ) : (
                        <>
                          <span className="text-sm">🚀</span>
                          Rute Otomatis
                        </>
                      )}
                    </button>
                    
                    {/* <button
                      onClick={openBengkelLocation}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg whitespace-nowrap"
                    >
                      <span className="text-sm">📍</span>
                      Lihat Lokasi
                    </button> */}
                  </div>
                </div>
              </div>
              <div className="h-80 md:h-96">
                <iframe
                  title="Lokasi Bengkel Las Abadi Jaya"
                  src="https://www.google.com/maps?q=-6.254683,107.085045&z=15&output=embed"
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
