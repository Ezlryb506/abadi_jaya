'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

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

type CategoryRow = { name: string };
type ProductRow = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  // Supabase join bisa mengembalikan objek tunggal atau array tergantung relasi
  product_categories: { name?: string } | { name?: string }[] | null;
};

type MaybeWithMessage = { message?: string };

// Data diambil dari Supabase, tidak lagi dari sample statis

export default function CatalogPage() {
  const [categories, setCategories] = useState<string[]>(['Semua']);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductUI | null>(null);
  const [products, setProducts] = useState<ProductUI[]>([]);
  const [, setLoading] = useState(false);
  const [, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    // Check user authentication
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

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
      const allCategories = ['Semua', ...((catData || []).map((c: CategoryRow) => c.name))];
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
      const mapped: ProductUI[] = (data || []).map((p: ProductRow) => {
        const catName = Array.isArray(p.product_categories)
          ? (p.product_categories[0]?.name || 'Lainnya')
          : (p.product_categories?.name || 'Lainnya');
        return {
          id: Number(p.id),
          name: String(p.name),
          category: catName,
          description: p.description || '',
          priceText: typeof p.price === 'number' ? `Rp ${p.price.toLocaleString('id-ID')}` : '-',
          image: p.image_url || categoryIcon(catName),
          features: [],
          specifications: {},
        };
      });
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

  const handleOrder = async (product: ProductUI) => {
    if (!user) {
      toast.info('Silakan masuk untuk memesan.', {
        description: 'Anda akan diarahkan ke halaman login.',
        duration: 5000,
        action: {
          label: 'Login',
          onClick: () => window.location.href = '/login?redirect=/catalog',
        },
      });
      return;
    }

    setOrderLoading(true);

    try {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (customerError) {
        throw new Error('Data customer tidak ditemukan. Silakan lengkapi profil Anda.');
      }

      const { data: categoryData, error: categoryError } = await supabase
        .from('product_categories')
        .select('id')
        .eq('name', product.category)
        .single();

      if (categoryError) {
        throw new Error('Kategori produk tidak ditemukan.');
      }

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          customer_id: customerData.id,
          category_id: categoryData.id,
          product_id: product.id,
          description: `Pesanan untuk produk: ${product.name}`,
          project_status: 'Survey',
          estimated_price: typeof product.priceText === 'string' && product.priceText !== '-' 
            ? parseFloat(product.priceText.replace(/[^0-9]/g, '')) 
            : 0,
          payment_method: 'DP',
        });

      if (transactionError) {
        throw new Error(`Gagal membuat pesanan: ${transactionError.message}`);
      }

      toast.success('Pesanan berhasil dibuat!', {
        description: 'Anda dapat melihat detail pesanan di dasbor Anda.',
        duration: 5000,
      });

    } catch (error: unknown) {
      const msg = (error && typeof error === 'object' && 'message' in error)
        ? String((error as MaybeWithMessage).message || 'Terjadi kesalahan yang tidak diketahui.')
        : 'Terjadi kesalahan yang tidak diketahui.';
      toast.error('Gagal membuat pesanan.', {
        description: msg,
      });
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Katalog Produk
          </h1>
          <p className="text-xl text-orange-100">Temukan produk las dan fabrikasi besi berkualitas tinggi untuk kebutuhan Anda.</p>
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
          {filteredProducts.map((product, idx) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col"
              onClick={() => setSelectedProduct(product)}
            >
              {/* Product Image */}
              <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                {product.image.startsWith('http') ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={800}
                    height={400}
                    className="object-contain h-40 w-full"
                    priority={idx === 0}
                    fetchPriority={idx === 0 ? 'high' : 'auto'}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                ) : (
                  <span className="text-6xl">{product.image}</span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-3">
                  <span className="inline-block bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {product.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                  {product.description}
                </p>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-orange-600">
                    {product.priceText || '-'}
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
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOrder(product);
                    }}
                    disabled={orderLoading}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {orderLoading ? '⏳ Memproses...' : '🛒 Pesan'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openWhatsApp(product);
                    }}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 cursor-pointer"
                  >
                    💬 Konsultasi
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                    className="px-3 py-2 border border-orange-500 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-500 hover:text-white transition-all cursor-pointer"
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
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      width={1000}
                      height={600}
                      className="object-contain h-56 w-full"
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
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleOrder(selectedProduct)}
                        disabled={orderLoading}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {orderLoading ? '⏳ Memproses...' : '🛒 Pesan Sekarang'}
                      </button>
                      <button
                        onClick={() => openWhatsApp(selectedProduct)}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        💬 Konsultasi
                      </button>
                    </div>
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
