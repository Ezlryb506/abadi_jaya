"use client";

import { useEffect, useState } from "react";

type Props = {
  name: string;
  backHref: string;
};

export default function ProductDetailActions({ name, backHref }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // no-op; reserved for scroll lock when modal open
  }, [open]);

  const onConfirmOrder = async () => {
    try {
      setSubmitting(true);
      // TODO: Integrasikan server action/endpoint transaksi bila tersedia
      // Sementara arahkan ke WhatsApp sebagai fallback UX
      const message = `Halo! Saya ingin memesan produk ${name}.`;
      const encoded = encodeURIComponent(message);
      window.open(`https://wa.me/6289653754317?text=${encoded}`, "_blank");
      setOpen(false);
    } catch {
      // Optional: kirim ke error tracking di masa depan
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Actions inline pada semua ukuran layar (tanpa menampilkan harga untuk menghindari duplikasi) */}
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <a
          href={backHref}
          className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg border border-orange-500 text-orange-600 hover:bg-orange-50 transition"
        >
          ← Kembali
        </a>
        <a
          href={`https://wa.me/6289653754317?text=${encodeURIComponent('Halo! Saya tertarik dengan produk ' + name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow hover:from-orange-600 hover:to-orange-700 transition"
        >
          💬 Konsultasi
        </a>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white shadow hover:from-green-600 hover:to-green-700 transition"
        >
          🛒 Pesan
        </button>
      </div>

      {/* Modal Konfirmasi */}
      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full md:max-w-md md:rounded-2xl bg-white border border-orange-100 shadow-2xl rounded-t-2xl p-5 animate-in slide-in-from-bottom-4 md:zoom-in-95">
            <h3 className="text-lg font-semibold mb-2">Konfirmasi Pesanan</h3>
            <p className="text-gray-600 mb-4">Anda akan memesan produk <span className="font-medium">{name}</span>.</p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirmOrder}
                disabled={submitting}
                aria-busy={submitting}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white shadow hover:from-green-600 hover:to-green-700 disabled:opacity-60"
              >
                {submitting ? "Memproses…" : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
