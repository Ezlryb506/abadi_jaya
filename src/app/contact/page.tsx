'use client';

import { useEffect, useRef, useState } from 'react';
import { areaGroups } from '@/lib/areaLayanan';

export default function ContactPage() {
  
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  // Tinggi dinamis untuk map agar menyamai tinggi total kartu di sidebar kiri
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const mapCardRef = useRef<HTMLDivElement | null>(null);
  const mapHeaderRef = useRef<HTMLDivElement | null>(null);
  const [mapHeight, setMapHeight] = useState<number | null>(null);

  useEffect(() => {
    const MIN_H = 24 * 16; // 24rem = 384px
    const MAX_H = 90 * 16; // ~1440px (90rem) as a safe cap
    let raf = 0;
    const compute = () => {
      const rect = leftColRef.current?.getBoundingClientRect();
      const leftH = rect?.height ?? null;
      if (!leftH) return;
      // Kurangi tinggi header map card (judul + paddings + border bottom 1px)
      const headerH = (mapHeaderRef.current?.offsetHeight ?? 0) + 1;
      const target = leftH - headerH;
      const clamped = Math.max(MIN_H, Math.min(target, MAX_H));
      // Hindari loop: hanya update jika beda > 2px
      if (mapHeight == null || Math.abs(clamped - mapHeight) > 2) {
        setMapHeight(clamped);
      }
    };
    // Hitung saat mount
    raf = window.requestAnimationFrame(compute);
    // Observasi perubahan ukuran konten sidebar kiri
    const target = leftColRef.current;
    let ro: ResizeObserver | null = null;
    if (target && typeof ResizeObserver !== 'undefined') {
      let ticking = false;
      ro = new ResizeObserver(() => {
        if (!ticking) {
          ticking = true;
          raf = window.requestAnimationFrame(() => {
            ticking = false;
            compute();
          });
        }
      });
      ro.observe(target);
    }
    // Recompute saat resize window
    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (ro && target) ro.unobserve(target);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [mapHeight]);

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

  // Catatan: tautan Google Maps tersedia di tombol "Buka di Google Maps" pada helper di bawah peta.

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
          <div ref={leftColRef} className="lg:col-span-1 space-y-6">
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
              {locationError && (
                <div
                  className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3"
                  role="status"
                  aria-live="polite"
                >
                  {locationError}
                </div>
              )}
            </div>

            {/* Address Card: simple info only (no buttons) */}
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

            {/* Web Developer Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">👨‍💻</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Web Developer (Fullstack)</h3>
                  <p className="text-gray-600">Arizal Winangun</p>
                  {/* Badge: Freelance Available */}
                  <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200">
                    Freelance Available
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-gray-500">Laporkan masalah</p>
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <a
                    href="tel:+6288809635936"
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    +62 888-0963-5936
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span>✉️</span>
                  <a
                    href="mailto:Arijalwinangun@gmail.com?subject=[Abadi%20Jaya]%20Inquiry%20Website&body=Halo%20Arizal%2C%20saya%20ingin%20..."
                    className="text-blue-600 hover:text-blue-700 font-medium break-all"
                  >
                    Arijalwinangun@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span>💬</span>
                  <a
                    href="https://wa.me/6288809635936?text=Halo%20Arizal%2C%20saya%20ingin%20melaporkan%20masalah%20di%20website%20Abadi%20Jaya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    WhatsApp
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span>🗂️</span>
                  <a
                    href="https://rizaldev-id.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Lihat Portofolio
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form & Map - Right Side */}
          <div className="lg:col-span-2 space-y-8">

            {/* Enhanced Map Card dengan Smart Route Finding */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div ref={mapHeaderRef} className="p-6 bg-gray-50 border-b border-gray-200">
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
                  </div>
                </div>
              </div>
              
              <div
                ref={mapCardRef}
                className="overflow-hidden"
                style={{ height: mapHeight ?? 384, maxHeight: 1440, minHeight: 384, transition: 'height 300ms ease' }}
              >
                <iframe
                  title="Lokasi Bengkel Las Abadi Jaya"
                  src="https://www.google.com/maps?q=-6.254683,107.085045&z=15&output=embed&hl=id&region=ID"
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0"
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
                {/* Fallback Helper: muncul halus di bawah peta untuk kasus ad blocker memblokir map/telemetry */}
                <div className="p-4 bg-orange-50/60 border-t border-orange-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-sm text-orange-800 flex items-start gap-2">
                    <span className="text-xl leading-none">🛡️</span>
                    <p>
                      Jika peta tidak tampil (kemungkinan diblokir extension), Anda masih bisa membuka lokasi langsung di Google Maps
                      atau memulai rute otomatis dari lokasi Anda.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://www.google.com/maps?q=-6.254683,107.085045&z=15"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-orange-700 border border-orange-200 hover:bg-orange-100 transition shadow-sm"
                    >
                      <span>📍</span>
                      <span>Buka di Google Maps</span>
                    </a>
                    <button
                      type="button"
                      onClick={getUserLocation}
                      disabled={isLoadingLocation}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shadow-sm transition border ${
                        isLoadingLocation
                          ? 'bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600 hover:from-green-600 hover:to-green-700'
                      }`}
                      aria-live="polite"
                    >
                      <span>🚀</span>
                      <span>{isLoadingLocation ? 'Menyiapkan Rute…' : 'Rute Otomatis'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Area Layanan (Terpisah dari sidebar & map, ditempatkan di bawah grid) */}
        <div className="mt-10">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>🗺️</span>
                <span>Area Layanan Kami</span>
              </h2>
              <p className="text-gray-600 mt-1 text-sm">Kami melayani wilayah Bekasi dan sekitarnya. Berikut beberapa area utama:</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {areaGroups.map((group) => (
                <div key={group.title} className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
                  <div className={`px-4 py-3 bg-gradient-to-r ${group.gradient} text-white`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{group.icon}</span>
                      <h3 className="font-semibold">{group.title}</h3>
                    </div>
                  </div>
                  <ul className="p-4 text-gray-700 text-sm space-y-1 list-disc list-inside">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
