'use client';

import AdminProfile from '../products/components/AdminProfile';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Pengaturan Admin</h1>
        </div>
      </div>

      <section aria-label="Pengaturan Admin">
        <AdminProfile />
      </section>
    </div>
  );
}
