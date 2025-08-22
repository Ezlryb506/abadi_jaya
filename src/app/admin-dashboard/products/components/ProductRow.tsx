'use client';

import { ProductRow } from '../types';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ProductRowProps {
  product: ProductRow;
  onEdit: (product: ProductRow) => void;
  onToggleStatus: (id: number, currentStatus: boolean | null) => void;
  onDelete: (id: number) => void;
}

// Format harga hanya di client untuk menghindari mismatch SSR vs Client
function PriceText({ value }: { value: number | null }) {
  const [text, setText] = useState<string>(value != null ? `Rp ${value}` : '-');
  useEffect(() => {
    if (value == null) setText('-');
    else {
      try {
        setText(`Rp ${new Intl.NumberFormat('id-ID').format(value)}`);
      } catch {
        setText(`Rp ${value}`);
      }
    }
  }, [value]);
  return <span suppressHydrationWarning>{text}</span>;
}

export default function ProductRowComponent({ product, onEdit, onToggleStatus, onDelete }: ProductRowProps) {
  return (
    <tr key={product.id} className="border-b hover:bg-gray-50/70 transition-colors">
      <td className="px-5 md:px-6 py-3">
        {product.image_url ? (
          <Image 
            src={product.image_url} 
            alt={product.name} 
            width={64}
            height={64}
            className="w-16 h-16 object-cover rounded"
            sizes="64px"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </td>
      <td className="px-5 md:px-6 py-3">{product.name}</td>
      <td className="px-5 md:px-6 py-3">{product.product_categories?.name || '-'}</td>
      <td className="px-5 md:px-6 py-3">
        <PriceText value={product.price} />
      </td>
      <td className="px-5 md:px-6 py-3">
        <span 
          className={`px-2 py-1 text-xs rounded-full ${
            product.is_active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          {product.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      </td>
      <td className="px-5 md:px-6 py-3">
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onEdit(product)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            title="Edit produk"
            aria-label={`Edit produk ${product.name}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 00.707-.293l10.414-10.414a2 2 0 10-2.828-2.828L6.465 16.88A1 1 0 006.172 17.586V20z"/></svg>
            <span>Edit</span>
          </button>
          <button
            onClick={() => onToggleStatus(product.id, product.is_active)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition focus:outline-none focus:ring-2 active:scale-[0.98] ${
              product.is_active
                ? 'border-yellow-200 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:ring-yellow-300'
                : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100 focus:ring-green-300'
            }`}
            title={product.is_active ? 'Nonaktifkan produk' : 'Aktifkan produk'}
            aria-label={`${product.is_active ? 'Nonaktifkan' : 'Aktifkan'} produk ${product.name}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={product.is_active ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"} />
            </svg>
            <span>{product.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-300 transition"
            title="Hapus produk"
            aria-label={`Hapus produk ${product.name}`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-1-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2"/></svg>
            <span>Hapus</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

