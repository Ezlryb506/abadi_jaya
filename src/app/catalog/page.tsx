'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface ProductUI {
  id: number;
  name: string;
  category: string;
  description: string;
  priceText: string;
  image: string;
  features: string[];
  specifications: Record<string, string>;
}

// Data diambil dari Supabase, tidak lagi dari sample statis

export default function CatalogPage() {
  const [categories, setCategories] = useState<string[]>(['Semua']);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductUI | null>(null);
  const [products, setProducts] = useState<ProductUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      // Fetch all categories
      const { data: catData, error: catError } = await supabase
        .from('product_categories')
        .select('name')
        .order('name');
      if (catError) {
        setError('Gagal memuat kategori');
        setLoading(false);
        return;
      }
      const allCategories = ['Semua', ...((catData || []).map((c: any) => c.name))];
      setCategories(allCategories);

      // Fetch products
      const { data, error } = await supabase
        .from('products')
        .select('id,name,description,price,image_url,product_categories(name)')
        .eq('is_active', true)
        .order('id', { ascending: false });
      if (error) {
        setError('Gagal memuat produk');
        setLoading(false);
        return;
      }
      const categoryIcon = (name?: string) => {
        switch ((name || '').toLowerCase()) {
          case 'pagar': return '🏗️';
          case 'kanopi': return '🚗';
          case 'railing tangga': return '🪜';
          case 'pintu besi': return '🚪';
          case 'jendela': return '🪟';
          case 'teralis': return '🔒';
          case 'tangga putar': return '🔄';
          case 'stainless': return '✨';
          case 'minimalis': return '📏';
          default: return '🧰';
        }
      };
      const mapped: ProductUI[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.product_categories?.name || 'Lainnya',
        description: p.description || '',
        priceText: typeof p.price === 'number' ? `Rp ${p.price.toLocaleString('id-ID')}` : '-',
        image: p.image_url || categoryIcon(p.product_categories?.name),
        features: [],
        specifications: {},
      }));
      setProducts(mapped);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => products.filter(product => {
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [products, selectedCategory, searchQuery]);

  const openWhatsApp = (product: ProductUI) => {
    const message = `Halo! Saya tertarik dengan produk ${product.name}. Bisa minta informasi lebih detail?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/6289653754317?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Katalog Produk
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Temukan produk las dan fabrikasi besi berkualitas tinggi untuk kebutuhan Anda
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 -mt-10 relative z-10">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search Bar */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Cari Produk
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Cari nama atau deskripsi produk..."
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
              <div className="relative">
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  {categories.map((category) => (
                    <option 
                      key={category} 
                      value={category}
                      className="text-gray-900 bg-white py-2 px-3 hover:bg-orange-50"
                      style={{ color: '#111827', backgroundColor: '#ffffff' }}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              {/* Product Image */}
              <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                {product.image.startsWith('http') ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-contain h-40 w-full"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-6xl">{product.image}</span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-3">
                  <span className="inline-block bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {product.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {product.description}
                </p>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-orange-600">
                    {(product as any).priceText || '-'}
                  </span>
                </div>

                {/* Features Preview */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {product.features.slice(0, 2).map((feature, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                    {product.features.length > 2 && (
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        +{product.features.length - 2} lagi
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openWhatsApp(product);
                    }}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 cursor-pointer"
                  >
                    💬 Konsultasi
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                    className="px-4 py-2 border border-orange-500 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-500 hover:text-white transition-all cursor-pointer"
                  >
                    📋 Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Products Found */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Produk Tidak Ditemukan</h3>
            <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian Anda</p>
          </div>
        )}

        {/* Product Count */}
        <div className="text-center mt-8 text-gray-600">
          Menampilkan {filteredProducts.length} dari {products.length} produk
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="inline-block bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full mb-2">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedProduct.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="h-64 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                  {selectedProduct.image.startsWith('http') ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="object-contain h-56 w-full"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-8xl">{selectedProduct.image}</span>
                  )}
                </div>

                {/* Product Details */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Deskripsi</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Fitur Utama</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProduct.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Spesifikasi</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 text-sm">{key}:</span>
                          <span className="text-gray-800 text-sm font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-3xl font-bold text-orange-600 mb-4">
                      {selectedProduct.priceText}
                    </div>
                    <button
                      onClick={() => openWhatsApp(selectedProduct)}
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
