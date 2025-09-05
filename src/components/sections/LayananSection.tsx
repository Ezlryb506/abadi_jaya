'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

interface ServiceCard {
  id: number;
  icon: string; // legacy, kept as fallback
  image: string; // path under /public/images/layanan
  title: string;
  description: string;
  category: string;
}

const services: ServiceCard[] = [
  {
    id: 1,
    icon: '🏗️',
    image: '/images/layanan/pagar besi - modern 1.jpg',
    title: 'Pagar Besi',
    description: 'Pagar besi minimalis/modern, kuat dan tahan cuaca, kustom ukuran & motif',
    category: 'Pagar'
  },
  {
    id: 2,
    icon: '🏠',
    image: '/images/layanan/Modern Carport - Kanopi - 2.jpg',
    title: 'Kanopi & Carport',
    description: 'Kanopi teras/garasi, material berkualitas (spandek, polycarbonate, hollow), rapi & presisi',
    category: 'Kanopi'
  },
  {
    id: 3,
    icon: '🪜',
    image: '/images/layanan/Railing Tangga - Logam - 9.jpg',
    title: 'Railing Tangga',
    description: 'Railing tangga besi/stainless untuk rumah & komersial, aman, ergonomis, dan estetik',
    category: 'Railing'
  },
  {
    id: 4,
    icon: '🚪',
    image: '/images/layanan/Pintu Besi - Modern - 2.jpg',
    title: 'Pintu Besi',
    description: 'Pintu besi rumah/gerbang, finishing halus dan kokoh, kustom model',
    category: 'Pintu'
  },
  {
    id: 5,
    icon: '🪟',
    image: '/images/layanan/Jendela - Teralis - Pagar - Modern 6.jpg',
    title: 'Jendela & Teralis',
    description: 'Teralis jendela dengan desain aman & menarik, bisa tambah kasa nyamuk',
    category: 'Jendela'
  },
  {
    id: 6,
    icon: '✨',
    image: '/images/layanan/Stainless Steel - Railing Tangga - 2.jpg',
    title: 'Stainless Steel',
    description: 'Produk stainless premium: tahan karat, higienis, finishing halus',
    category: 'Stainless'
  },
  {
    id: 7,
    icon: '🌿',
    image: '/images/layanan/Kanopi - Pargola - Taman - Modern - 5.jpg',
    title: 'Pergola & Kanopi Taman',
    description: 'Pergola/kanopi estetik untuk teras & taman, teduh, nyaman, tahan cuaca',
    category: 'Kanopi',
  },
  {
    id: 8,
    icon: '🪟',
    image: '/images/layanan/Railing Balkon - Modern - Minimalis 2.jpg',
    title: 'Railing Balkon',
    description: 'Railing balkon minimalis/modern, aman dan mempercantik fasad',
    category: 'Railing',
  },
  {
    id: 9,
    icon: '🚪',
    image: '/images/layanan/Pintu Gerbang - Modern - Stainless 1.jpg',
    title: 'Pintu Gerbang',
    description: 'Gerbang besi/stainless, sistem dorong/geser, kunci aman dan awet',
    category: 'Pintu',
  },
  {
    id: 10,
    icon: '✨',
    image: '/images/layanan/kitchen Set - Rak - Stainless - 2.jpg',
    title: 'Kitchen Set Stainless',
    description: 'Meja sink & kabinet stainless, higienis untuk rumah/komersial',
    category: 'Stainless',
  },
  {
    id: 11,
    icon: '🧰',
    image: '/images/layanan/Rak Stainless 1.jpg',
    title: 'Rak & Meja Stainless',
    description: 'Rak/meja stainless kuat, higienis, cocok gudang/komersial',
    category: 'Stainless',
  },
  {
    id: 12,
    icon: '🧭',
    image: '/images/layanan/Handrail Tembok Tangga 2.jpg',
    title: 'Handrail Tangga Stainless',
    description: 'Handrail ergonomis, finishing premium, aman untuk semua usia',
    category: 'Stainless',
  },
];

export default function LayananSection() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // 12 kategori layanan + "Semua" sebagai item pertama (total 13)
  const allCategories = useMemo(() => {
    const titles = services.map((s) => s.title);
    return ['Semua', ...titles];
  }, []);

  // Filter: jika bukan "Semua", cocokkan ke title layanan
  const filteredServices = selectedCategory === 'Semua'
    ? services
    : services.filter(service => service.title === selectedCategory);

  // Pagination carousel untuk seluruh kategori (tanpa drag/x-scroll)
  const [itemsPerSlide, setItemsPerSlide] = useState(5);
  const [page, setPage] = useState(0);
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(allCategories.length / itemsPerSlide));
  }, [allCategories.length, itemsPerSlide]);

  useEffect(() => {
    const computeItemsPerSlide = () => {
      const w = window.innerWidth;
      if (w < 640) return 2; // mobile kecil
      if (w < 1024) return 3; // tablet / small desktop
      return 5; // desktop, agar tampil "Semua + id 1-4"
    };
    const update = () => setItemsPerSlide(computeItemsPerSlide());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Pastikan page valid saat itemsPerSlide berubah
  useEffect(() => {
    if (page > totalPages - 1) setPage(totalPages - 1);
  }, [totalPages, page]);

  const handlePrev = () => setPage((p) => Math.max(0, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  const carouselContainerRef = useRef<HTMLDivElement | null>(null);
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <section id="layanan" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Layanan Unggulan Kami
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Jasa las profesional: pagar besi, kanopi, railing, pintu besi, teralis, hingga stainless. Kustom sesuai kebutuhan dan desain Anda.
          </p>
        </div>

        {/* Category Filter: Single carousel 13 item (termasuk "Semua"), tanpa x-scroll */}
        <div
          ref={carouselContainerRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          aria-roledescription="carousel"
          aria-label="Kategori layanan"
          className="relative mb-12 outline-none"
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className={`inline-flex items-center justify-center w-11 h-11 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 ${page === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Sebelumnya"
            >
              ‹
            </button>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {allCategories
                .slice(page * itemsPerSlide, page * itemsPerSlide + itemsPerSlide)
                .map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`inline-flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-300 border min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 ${
                      selectedCategory === category
                        ? 'bg-orange-600 text-white shadow-lg border-orange-600'
                        : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-300'
                    }`}
                    aria-pressed={selectedCategory === category}
                    aria-label={`Filter kategori: ${category}`}
                  >
                    <span className="whitespace-nowrap">{category}</span>
                  </button>
                ))}
            </div>
            <button
              type="button"
              onClick={handleNext}
              className={`inline-flex items-center justify-center w-11 h-11 rounded-full bg-white border border-gray-300 shadow-sm hover:bg-gray-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 ${page >= totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Berikutnya"
            >
              ›
            </button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                aria-label={`Ke halaman ${i + 1}`}
                aria-current={i === page}
                className="group w-11 h-11 flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
              >
                <span
                  aria-hidden
                  className={`w-2.5 h-2.5 rounded-full transition ${i === page ? 'bg-orange-600' : 'bg-gray-300 group-hover:bg-gray-400'}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service, index) => (
            <div
              key={service.id}
              className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 animate-fade-in-up"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              {/* Media */}
              <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden mb-4 ring-1 ring-gray-100">
                {service.image ? (
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, calc(100vw-48px)"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={index === 0}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    quality={70}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-orange-50 text-5xl">
                    <span>{service.icon}</span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              
              {/* Action Button: always visible on mobile, hover-reveal on ≥sm */}
              <div className="mt-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                <button
                  className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 min-h-[44px]"
                  onClick={() => window.open('https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las', '_blank')}
                  aria-label="Konsultasi sekarang via WhatsApp"
                  title="Konsultasi sekarang via WhatsApp"
                >
                  Konsultasi Sekarang
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
