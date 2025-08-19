'use client';

import { useState } from 'react';

interface ServiceCard {
  id: number;
  icon: string;
  title: string;
  description: string;
  price: string;
  category: string;
}

const services: ServiceCard[] = [
  {
    id: 1,
    icon: '🏗️',
    title: 'Pagar Besi',
    description: 'Pagar minimalis, pagar klasik, pagar modern dengan berbagai desain dan ukuran',
    price: 'Mulai Rp 500.000',
    category: 'Pagar'
  },
  {
    id: 2,
    icon: '🏠',
    title: 'Kanopi & Carport',
    description: 'Kanopi teras, carport mobil, kanopi garasi dengan material berkualitas',
    price: 'Mulai Rp 1.000.000',
    category: 'Kanopi'
  },
  {
    id: 3,
    icon: '🪜',
    title: 'Railing Tangga',
    description: 'Railing tangga putar, railing minimalis, railing stainless steel',
    price: 'Mulai Rp 800.000',
    category: 'Railing'
  },
  {
    id: 4,
    icon: '🚪',
    title: 'Pintu Besi',
    description: 'Pintu garasi, rolling door, pintu besi dengan sistem keamanan tinggi',
    price: 'Mulai Rp 1.500.000',
    category: 'Pintu'
  },
  {
    id: 5,
    icon: '🪟',
    title: 'Jendela & Teralis',
    description: 'Jendela besi, kasa nyamuk, teralis jendela dengan desain menarik',
    price: 'Mulai Rp 300.000',
    category: 'Jendela'
  },
  {
    id: 6,
    icon: '✨',
    title: 'Stainless Steel',
    description: 'Produk stainless steel premium dengan finishing berkualitas tinggi',
    price: 'Mulai Rp 1.000.000',
    category: 'Stainless'
  }
];

export default function LayananSection() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  
  const categories = ['Semua', 'Pagar', 'Kanopi', 'Railing', 'Pintu', 'Jendela', 'Stainless'];
  
  const filteredServices = selectedCategory === 'Semua' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  return (
    <section id="layanan" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Layanan Unggulan Kami
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Berbagai jenis jasa las dan fabrikasi dengan kualitas terbaik dan harga terjangkau
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-up animation-delay-200">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service, index) => (
            <div
              key={service.id}
              className="group bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 animate-fade-in-up"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">{service.icon}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <div className="text-orange-500 font-semibold">{service.price}</div>
              
              {/* Hover Effect */}
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
                  onClick={() => window.open('https://wa.me/6289653754317?text=Halo! Saya ingin konsultasi tentang jasa las', '_blank')}
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
