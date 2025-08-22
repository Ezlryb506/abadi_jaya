import { Dialog } from '@headlessui/react';
import type { User } from '@supabase/supabase-js';

const menuItems = [
  { key: 'profile', label: 'Profil' },
  { key: 'orders', label: 'Pesanan Saya' },
  { key: 'faq', label: 'FAQ & Bantuan' },
];

interface SidebarProps {
  user: User | null;
  profileForm: { name: string };
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  handleLogout: () => void;
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ 
  user, 
  profileForm, 
  activeMenu, 
  setActiveMenu, 
  handleLogout, 
  showLogoutModal, 
  setShowLogoutModal,
  sidebarOpen,
  setSidebarOpen
}: SidebarProps) {
  return (
    <>
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 shadow-lg flex flex-col py-8 px-4 transition-transform duration-300 ease-in-out lg:top-0 top-16`}>
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-3xl text-orange-600 font-bold mb-2">
            <span>👤</span>
          </div>
          <div className="font-semibold text-gray-800">{profileForm.name || user?.user_metadata?.name || user?.email || "User"}</div>
          <div className="text-xs text-gray-500 break-all">{user?.email}</div>
        </div>
        <nav className="space-y-2 mb-4">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all ${
                activeMenu === item.key
                  ? "bg-orange-100 text-orange-700"
                  : "text-gray-700 hover:bg-orange-50"
              }`}
              onClick={() => {
                setActiveMenu(item.key);
                if (window.innerWidth < 1024) {
                  setSidebarOpen(false);
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="mt-4 w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition-all cursor-pointer"
        >
          Logout
        </button>
        <Dialog open={showLogoutModal} onClose={() => setShowLogoutModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm mx-auto z-50">
            <Dialog.Title className="text-lg font-bold mb-4">Konfirmasi Logout</Dialog.Title>
            <Dialog.Description className="mb-6 text-gray-600">Yakin ingin logout?</Dialog.Description>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">Batal</button>
              <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 cursor-pointer">Ya, Logout</button>
            </div>
          </div>
        </Dialog>
      </aside>
      {sidebarOpen && (
				<div 
					className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
					onClick={() => setSidebarOpen(false)}
				/>
			)}
    </>
  );
}
