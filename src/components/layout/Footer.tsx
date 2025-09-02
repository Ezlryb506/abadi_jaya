"use client";
import Image from 'next/image';
import { areaAll } from '@/lib/areaLayanan';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [expanded, setExpanded] = useState(false);
  const VISIBLE_COUNT = 8; // jumlah default yang ditampilkan di mobile sebelum tombol "Tampilkan lebih banyak"
  // Guard untuk menghindari hydration mismatch: hanya terapkan kelas dinamis setelah mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    // kontainer footer
    <footer id="kontak" className="bg-gray-800 text-white py-7 overflow-x-hidden [overflow-x:clip]">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 w-full overflow-x-hidden [overflow-x:clip]">

        {/* {3 grid konten} */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-w-0 md:divide-x md:divide-gray-700">

          {/* grid ke 1 */}
          <div className="md:pr-6">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/icons/icon-192x192.png"
                alt="Logo Abadi Jaya"
                width={40}
                height={40}
                className="rounded-lg shadow-sm"
                priority
              />
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
          
          {/* grid ke 2 */}
          <div className="min-w-0 md:px-6">
            <h4 className="text-lg font-semibold mb-4">Layanan kustom</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-300 min-w-0">
              <li>Pagar Besi</li>
              <li>Kanopi & Carport</li>
              <li>Railing Tangga</li>
              <li>Pintu Besi</li>
              <li>Jendela & Teralis</li>
              <li>Stainless Steel</li>
              <li>Pergola & Kanopi Taman</li>
              <li>Railing Balkon</li>
              <li>Pintu Gerbang</li>
              <li>Rolling Door</li>
              <li>Gerbang</li>
              <li>kitchen Set Stainless</li>
              <li>Rak & Meja Stainless</li>
              <li>Handrail Tangga Stainless</li>
            </ul>
          </div>

          {/* grid ke 3 */}
          <div className="min-w-0 md:pl-6">
            <h4 className="text-lg font-semibold mb-4">Kontak</h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center space-x-2">
                <span>📍</span>
                <span className="break-words">Gg. Bunga, Wanasari, Kec. Cibitung, Kabupaten Bekasi, Jawa Barat 17520</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📞</span>
                <span className="break-words">+62 896-5375-4317</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🕒</span>
                <span className="break-words">Senin - Sabtu: 08:00 - 17:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Area Layanan sebagai chips dinamis */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <h4 className="text-lg font-semibold mb-3 text-center">Area Layanan Kami</h4>
          <ul className="flex flex-wrap items-center justify-center gap-2">
            {areaAll.map((area, idx) => (
              <li
                key={area}
                className={`shrink-0 ${mounted && !expanded && idx >= VISIBLE_COUNT ? 'hidden md:list-item' : ''}`}
              >
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-sm hover:bg-orange-100 hover:border-orange-300 transition-colors select-none">
                  <span aria-hidden className="text-green-600">✔️</span>
                  <span className="font-medium">{area}</span>
                </span>
              </li>
            ))}
          </ul>
          {areaAll.length > VISIBLE_COUNT && (
            <div className="mt-4 flex justify-center md:hidden">
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-600 text-gray-100 hover:bg-gray-700 transition-colors"
                aria-expanded={expanded}
              >
                {expanded ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}
                <span aria-hidden>{expanded ? '⬆️' : '⬇️'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-gray-700 mt-8 pt-2 text-center text-gray-300">
          <p>&copy; 2025 Bengkel Las Abadi Jaya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

