export default function Footer() {
  return (
    <footer id="kontak" className="bg-gray-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <h3 className="text-2xl font-bold">Abadi Jaya</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Spesialis jasa las dan fabrikasi besi berkualitas tinggi dengan pengalaman bertahun-tahun.
            </p>

            {/* Bagian Baru: Laporkan Masalah / Umpan Balik */}
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
              <p className="mb-4">
                Ada masalah di website? <br className="md:hidden" /> Laporkan kepada kami agar secepatnya kami perbaiki.
              </p>
              <a
                href="https://wa.me/6288809635936?text=Halo Developer Website Abadi Jaya! Saya menemukan hal berikut di website: [Jelaskan masalahnya/pertanyaan Anda]"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md cursor-pointer"
              >
                <span className="text-xl mr-2">💬</span> Laporkan Masalah
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Layanan kustom</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Pagar Besi</li>
              <li>Kanopi</li>
              <li>Railing Tangga</li>
              <li>Pintu Besi</li>
              <li>Jendela & Teralis</li>
              <li>Stainless Steel</li>
              <li>Rolling Door</li>
              <li>Gerbang</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Kontak</h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center space-x-2">
                <span>📍</span>
                <span>Gg. Bunga, Wanasari, Kec. Cibitung, Kabupaten Bekasi, Jawa Barat 17520</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📞</span>
                <span>+62 896-5375-4317</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>✉️</span>
                <span>info@abadi-jaya.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🕒</span>
                <span>Senin - Sabtu: 08:00 - 17:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Bengkel Las Abadi Jaya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
