'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import EditOrderModal from '../components/EditOrderModal';

const OrderDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchOrderDetail = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          customers (*),
          product_categories (*),
          products (*),
          payment_history (*),
          project_updates (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching order details:', error);
        setError('Gagal memuat detail pesanan.');
      } else {
        setOrder(data);
      }
      setLoading(false);
    };

    fetchOrderDetail();

    const channel = supabase.channel(`realtime-order-detail-${id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions', filter: `id=eq.${id}` }, 
        (payload) => {
          fetchOrderDetail();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Memuat detail pesanan...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="text-center py-10">Pesanan tidak ditemukan.</div>;
  }

  const handleSaveOrder = (updatedOrder: any) => {
    setOrder((prevOrder: any) => ({ ...prevOrder, ...updatedOrder }));
  };

  return (
    <>
      <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Detail Pesanan #{order.id}</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/admin-dashboard/orders')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Kembali
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Edit Pesanan
            </button>
          </div>
        </div>
      </div>

      {/* Informasi Pelanggan dan Pesanan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Informasi Pelanggan</h2>
          <div className="space-y-2">
            <p><strong>Nama:</strong> {order.customers.name}</p>
            <p><strong>Telepon:</strong> {order.customers.phone}</p>
            <p><strong>Alamat:</strong> {order.customers.address}</p>
            <p><strong>Email:</strong> {order.customers.email}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Informasi Pesanan</h2>
          <div className="space-y-2">
            <p><strong>Tanggal Pesan:</strong> {new Date(order.order_date).toLocaleDateString('id-ID')}</p>
            <p><strong>Status Proyek:</strong> {order.project_status}</p>
            <p><strong>Estimasi Harga:</strong> Rp{new Intl.NumberFormat('id-ID').format(order.estimated_price)}</p>
            <p><strong>Total Bayar:</strong> Rp{new Intl.NumberFormat('id-ID').format(order.total_paid)}</p>
            <p><strong>Metode Pembayaran:</strong> {order.payment_method}</p>
          </div>
        </div>
      </div>

      {/* Detail Produk */}
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Detail Produk</h2>
        <p><strong>Kategori:</strong> {order.product_categories.name}</p>
        {order.products && <p><strong>Produk:</strong> {order.products.name}</p>}
        <p className="mt-2"><strong>Deskripsi Kustom:</strong></p>
        <p className="text-gray-600">{order.description}</p>
      </div>

      {/* Riwayat Proyek dan Pembayaran */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Update Proyek</h2>
          <ul className="space-y-3">
            {order.project_updates.length > 0 ? order.project_updates.map((update: any) => (
              <li key={update.id} className="border-b pb-2">
                <p><strong>Status:</strong> {update.status}</p>
                <p>{update.description}</p>
                <p className="text-sm text-gray-500">{new Date(update.created_at).toLocaleString('id-ID')}</p>
              </li>
            )) : <p>Belum ada update.</p>}
          </ul>
        </div>
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Riwayat Pembayaran</h2>
          <ul className="space-y-3">
            {order.payment_history.length > 0 ? order.payment_history.map((payment: any) => (
              <li key={payment.id} className="border-b pb-2">
                <p><strong>Jumlah:</strong> Rp{new Intl.NumberFormat('id-ID').format(payment.payment_amount)}</p>
                <p className="text-sm text-gray-500">{new Date(payment.payment_date).toLocaleString('id-ID')}</p>
              </li>
            )) : <p>Belum ada pembayaran.</p>}
          </ul>
        </div>
      </div>
    </div>
    <EditOrderModal 
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      order={order}
      onSave={handleSaveOrder}
    />
    </>
  );
};

export default OrderDetailPage;
