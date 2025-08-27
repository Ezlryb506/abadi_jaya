'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ProductRow } from '../types';
import ProductRowComponent from './ProductRow';

// Hindari mismatch SSR vs Client untuk pemformatan locale
function PriceText({ value }: { value: number | null }) {
  const [text, setText] = useState<string>(value != null ? `Rp ${value}` : '-');
  useEffect(() => {
    if (value == null) {
      setText('-');
    } else {
      try {
        setText(`Rp ${new Intl.NumberFormat('id-ID').format(value)}`);
      } catch {
        setText(`Rp ${value}`);
      }
    }
  }, [value]);
  return (
    <span suppressHydrationWarning>{text}</span>
  );
}

interface ProductListProps {
  products: ProductRow[];
  total?: number;
  page?: number;
  pageSize?: number;
  listLoading?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onEdit: (product: ProductRow) => void;
  onToggleStatus: (id: number, currentStatus: boolean | null) => void;
  onDelete: (id: number) => void;
}

export default function ProductList({ products, total = 0, page = 1, pageSize = 10, listLoading = false, onPageChange, onPageSizeChange, onEdit, onToggleStatus, onDelete }: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const filteredProducts = useMemo(() => {
    const q = debounced.toLowerCase();
    if (!q) return products;
    return products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(q);
      const catName = product.product_categories?.name || '';
      const catMatch = catName.toLowerCase().includes(q);
      return nameMatch || catMatch;
    });
  }, [debounced, products]);

  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
      <div className="p-5 md:p-6 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Daftar Produk</h2>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <input
                type="text"
                placeholder="Cari nama / kategori..."
                className="w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  aria-label="Clear search"
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {listLoading ? 'Memuat...' : `${filteredProducts.length} dari ${total} hasil`}
            </span>
            <div className="hidden sm:flex items-center gap-2">
              <label htmlFor="page-size" className="text-sm text-gray-600">Per halaman</label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                className="px-2 py-1.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                {[5,10,20,50].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden overflow-x-hidden">
        <div className="divide-y divide-gray-100">
          {listLoading ? (
            [1,2,3,4].map(i => (
              <div key={i} className="p-4 flex gap-3 animate-pulse">
                <div className="w-20 h-20 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <div key={p.id} className="p-4 flex gap-3 overflow-hidden">
                <div className="shrink-0">
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg border"
                      sizes="80px"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400 text-xs">No Image</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 break-words">{p.name}</div>
                      <div className="text-sm text-gray-500 break-words">{p.product_categories?.name || '-'}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.is_active ? 'Aktif' : 'Nonaktif'}</span>
                        <span className="text-sm font-semibold text-gray-900"><PriceText value={p.price} /></span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => onEdit(p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-[0.98]"
                      title="Edit produk"
                      aria-label={`Edit produk ${p.name}`}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 00.707-.293l10.414-10.414a2 2 0 10-2.828-2.828L6.465 16.88A1 1 0 006.172 17.586V20z"/></svg>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onToggleStatus(p.id, p.is_active)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition focus:outline-none focus:ring-2 active:scale-[0.98] ${p.is_active ? 'border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:ring-yellow-300' : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-300'}`}
                      title={p.is_active ? 'Nonaktifkan produk' : 'Aktifkan produk'}
                      aria-label={`${p.is_active ? 'Nonaktifkan' : 'Aktifkan'} produk ${p.name}`}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={p.is_active ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'} /></svg>
                      <span>{p.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
                    </button>
                    <button
                      onClick={() => onDelete(p.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 active:scale-[0.98]"
                      title="Hapus produk"
                      aria-label={`Hapus produk ${p.name}`}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-1-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2"/></svg>
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-gray-500">
              <div className="flex flex-col items-center gap-3">
                <svg className="h-8 w-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <div className="text-sm">{debounced ? 'Produk tidak ditemukan' : 'Belum ada produk'}</div>
                <a href="#add-product" className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                  Tambah Produk
                </a>
              </div>
            </div>
          )}
        </div>
        {/* Pagination controls mobile */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <button
            className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
            onClick={() => onPageChange?.(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Sebelumnya
          </button>
          <div className="text-sm text-gray-600">Hal {page} / {totalPages}</div>
          <button
            className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
            onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Berikutnya
          </button>
        </div>
      </div>

      {/* Table for md+ */}
      <div className="hidden md:block overflow-x-auto">
        <div className="max-h-96 overflow-y-auto relative">
          {listLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 4v2m0 12v2m8-8h-2M6 12H4m12.728 6.728-1.414-1.414M8.686 8.686 7.272 7.272m9.9 0-1.414 1.414M8.686 15.314l-1.414 1.414" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Memuat data...
              </div>
            </div>
          )}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-5 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar</th>
              <th className="px-5 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-5 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th className="px-5 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
              <th className="px-5 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-5 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductRowComponent
                    key={product.id}
                    product={product}
                    onEdit={onEdit}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="h-8 w-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <div className="text-sm">{debounced ? 'Produk tidak ditemukan' : 'Belum ada produk'}</div>
                      <a href="#add-product" className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                        Tambah Produk
                      </a>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination controls desktop */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Menampilkan</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="px-2 py-1.5 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            >
              {[5,10,20,50].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="text-sm text-gray-600">per halaman</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => onPageChange?.(1)}
              disabled={page <= 1}
              aria-label="Halaman pertama"
              title="Halaman pertama"
            >«</button>
            <button
              className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
              disabled={page <= 1}
              aria-label="Sebelumnya"
              title="Sebelumnya"
            >‹</button>
            <span className="text-sm text-gray-700">Hal {page} dari {totalPages}</span>
            <button
              className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              aria-label="Berikutnya"
              title="Berikutnya"
            >›</button>
            <button
              className="px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              onClick={() => onPageChange?.(totalPages)}
              disabled={page >= totalPages}
              aria-label="Halaman terakhir"
              title="Halaman terakhir"
            >»</button>
          </div>
        </div>
      </div>
    </div>
  );
}
