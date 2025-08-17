'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  price: string;
  status: 'completed' | 'in-progress' | 'planning';
  date: string;
  location: string;
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "Pagar Besi Minimalis Modern",
    category: "Pagar",
    description: "Pagar besi dengan desain minimalis modern, menggunakan material berkualitas tinggi dan finishing yang rapi.",
    image: "🏗️",
    price: "Rp 2.500.000",
    status: "completed",
    date: "Januari 2024",
    location: "Jakarta Selatan"
  },
  {
    id: 2,
    title: "Kanopi Stainless Steel Premium",
    category: "Kanopi",
    description: "Kanopi stainless steel dengan desain premium, tahan karat dan cocok untuk area outdoor.",
    image: "🏠",
    price: "Rp 4.200.000",
    status: "completed",
    date: "Februari 2024",
    location: "Bekasi"
  },
  {
    id: 3,
    title: "Railing Tangga Spiral",
    category: "Railing",
    description: "Railing tangga spiral dengan desain unik dan elegan, menggunakan material besi berkualitas.",
    image: "🔄",
    price: "Rp 3.800.000",
    status: "completed",
    date: "Maret 2024",
    location: "Depok"
  },
  {
    id: 4,
    title: "Pintu Besi Anti Maling",
    category: "Pintu",
    description: "Pintu besi dengan sistem keamanan tinggi, anti maling dan tahan lama.",
    image: "🚪",
    price: "Rp 5.500.000",
    status: "in-progress",
    date: "April 2024",
    location: "Tangerang"
  },
  {
    id: 5,
    title: "Jendela Teralis Artistik",
    category: "Jendela",
    description: "Jendela dengan teralis artistik, menggabungkan keamanan dan estetika.",
    image: "🪟",
    price: "Rp 1.800.000",
    status: "completed",
    date: "Maret 2024",
    location: "Jakarta Barat"
  },
  {
    id: 6,
    title: "Carport Stainless Steel",
    category: "Kanopi",
    description: "Carport stainless steel dengan atap transparan, memberikan perlindungan maksimal untuk kendaraan.",
    image: "🚗",
    price: "Rp 6.800.000",
    status: "planning",
    date: "Mei 2024",
    location: "Bogor"
  },
  {
    id: 7,
    title: "Pagar Rumah Minimalis",
    category: "Pagar",
    description: "Pagar rumah dengan desain minimalis modern, menggunakan material besi berkualitas.",
    image: "🏡",
    price: "Rp 3.200.000",
    status: "completed",
    date: "Januari 2024",
    location: "Jakarta Timur"
  },
  {
    id: 8,
    title: "Railing Balkon Premium",
    category: "Railing",
    description: "Railing balkon dengan desain premium dan material berkualitas tinggi.",
    image: "🏢",
    price: "Rp 2.800.000",
    status: "completed",
    date: "Februari 2024",
    location: "Jakarta Pusat"
  }
];

const categories = ['Semua', 'Pagar', 'Kanopi', 'Railing', 'Pintu', 'Jendela', 'Stainless'];
const statuses = ['Semua', 'completed', 'in-progress', 'planning'];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = galleryItems.filter(item => {
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Semua' || item.status === selectedStatus;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'in-progress': return 'Sedang Dikerjakan';
      case 'planning': return 'Perencanaan';
      default: return status;
    }
  };

  const openWhatsApp = (item: GalleryItem) => {
    const message = `Halo! Saya tertarik dengan proyek ${item.title}. Bisa minta informasi lebih detail?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/6289653754317?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Galeri Proyek
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Lihat hasil karya terbaik kami dalam berbagai proyek las dan fabrikasi besi
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 -mt-10 relative z-10">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search Bar */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Cari Proyek
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Cari nama proyek, deskripsi, atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === 'Semua' ? 'Semua Status' : getStatusText(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              {/* Project Image */}
              <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <span className="text-6xl">{item.image}</span>
              </div>

              {/* Project Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-block bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {item.description}
                </p>

                <div className="space-y-2 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>{item.date}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-xl font-bold text-orange-600">
                    {item.price}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openWhatsApp(item);
                    }}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
                  >
                    💬 Konsultasi
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item);
                    }}
                    className="px-4 py-2 border border-orange-500 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-500 hover:text-white transition-all"
                  >
                    📋 Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Projects Found */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Proyek Tidak Ditemukan</h3>
            <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian Anda</p>
          </div>
        )}

        {/* Project Count */}
        <div className="text-center mt-8 text-gray-600">
          Menampilkan {filteredItems.length} dari {galleryItems.length} proyek
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-block bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                      {selectedItem.category}
                    </span>
                    <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(selectedItem.status)}`}>
                      {getStatusText(selectedItem.status)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedItem.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Image */}
                <div className="h-64 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                  <span className="text-8xl">{selectedItem.image}</span>
                </div>

                {/* Project Details */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Deskripsi Proyek</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedItem.description}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Informasi Proyek</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lokasi:</span>
                        <span className="text-gray-800 font-medium">{selectedItem.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal:</span>
                        <span className="text-gray-800 font-medium">{selectedItem.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium px-2 py-1 rounded-full text-sm ${getStatusColor(selectedItem.status)}`}>
                          {getStatusText(selectedItem.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-3xl font-bold text-orange-600 mb-4">
                      {selectedItem.price}
                    </div>
                    <button
                      onClick={() => openWhatsApp(selectedItem)}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      💬 Konsultasi Sekarang
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
