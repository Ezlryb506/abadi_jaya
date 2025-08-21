'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const OrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          order_date,
          project_status,
          estimated_price,
          customers ( name )
        `)
        .order('order_date', { ascending: false });

      if (error) {
        setError('Gagal memuat data pesanan.');
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    fetchOrders();

    const channel = supabase.channel('realtime-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, 
        (payload) => {
          // Re-fetch data on any change
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        (order.customers?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Production':
        return 'bg-blue-100 text-blue-800';
      case 'Installation':
        return 'bg-purple-100 text-purple-800';
      case 'Design':
        return 'bg-yellow-100 text-yellow-800';
      case 'Survey':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <>
      <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-3 w-full">Kelola Pesanan</h1>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari berdasarkan nama pelanggan atau ID pesanan..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List (Mobile) */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="text-center py-4">Memuat data...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Tidak ada pesanan.</div>
          ) : (
            filteredOrders.map((order) => {
              const statusClass = getStatusClass(order.project_status);
              return (
                <div key={order.id} className="rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">ID Pesanan</p>
                      <p className="text-base font-semibold">#{order.id}</p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>{order.project_status}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-700 space-y-1">
                    <p><strong>Pelanggan:</strong> {order.customers?.name || 'N/A'}</p>
                    <p><strong>Tanggal:</strong> {new Date(order.order_date).toLocaleDateString('id-ID')}</p>
                    <p><strong>Total:</strong> Rp{new Intl.NumberFormat('id-ID').format(order.estimated_price)}</p>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => router.push(`/admin-dashboard/orders/${order.id}`)}
                      className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tabel (Desktop) */}
        <div className="overflow-x-auto hidden md:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pesanan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Memuat data...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-red-500">{error}</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customers?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.order_date).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.project_status)}`}>
                        {order.project_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp{new Intl.NumberFormat('id-ID').format(order.estimated_price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin-dashboard/orders/${order.id}`)}
                        className="px-3 py-1.5 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
                        title="Lihat Detail Pesanan"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default OrdersPage;
