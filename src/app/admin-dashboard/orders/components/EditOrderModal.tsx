'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Order {
  id: number;
  project_status: string;
  estimated_price: number;
}

interface EditOrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrder: Order) => void;
}

const EditOrderModal = ({ order, isOpen, onClose, onSave }: EditOrderModalProps) => {
  const [formData, setFormData] = useState({ project_status: '', estimated_price: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setFormData({
        project_status: order.project_status,
        estimated_price: order.estimated_price,
      });
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'estimated_price' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        project_status: formData.project_status,
        estimated_price: formData.estimated_price,
      })
      .eq('id', order.id);

    setIsSaving(false);

    if (updateError) {
      console.error('Error updating order:', updateError);
      setError('Gagal menyimpan perubahan.');
    } else {
      onSave({ ...order, ...formData });
      onClose();
    }
  };

  const projectStatuses = ['Survey', 'Design', 'Production', 'Installation', 'Completed'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Pesanan #{order.id}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="project_status" className="block text-sm font-medium text-gray-700">Status Proyek</label>
            <select
              id="project_status"
              name="project_status"
              value={formData.project_status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {projectStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="estimated_price" className="block text-sm font-medium text-gray-700">Estimasi Harga</label>
            <input
              type="number"
              id="estimated_price"
              name="estimated_price"
              value={formData.estimated_price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              disabled={isSaving}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
              disabled={isSaving}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderModal;
