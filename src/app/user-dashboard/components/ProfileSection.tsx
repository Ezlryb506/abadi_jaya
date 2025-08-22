import type { User } from '@supabase/supabase-js';

interface ProfileForm {
  name: string;
  phone: string;
  provinsi: string;
  kota: string;
  kecamatan: string;
  kelurahan: string;
  namaJalan: string;
  gang: string;
  rtRw: string;
  noRumah: string;
  email: string;
}

interface ProfileSectionProps {
  user: User | null;
  profileForm: ProfileForm;
  handleProfileChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleProfileSave: (e: React.FormEvent) => void;
  profileSaving: boolean;
  profileLoading: boolean;
  profileMsg: string;
  profileErr: string;
}

export default function ProfileSection({ 
  user, 
  profileForm, 
  handleProfileChange, 
  handleProfileSave, 
  profileSaving, 
  profileLoading, 
  profileMsg, 
  profileErr 
}: ProfileSectionProps) {
  const isEmailVerified = Boolean(user?.email_confirmed_at);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isEmailVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
            {isEmailVerified ? "Terverifikasi" : "Belum Verifikasi"}
          </span>
        </div>
        
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-1">Email</div>
          <div className="font-medium text-gray-800 break-all">{profileForm.email}</div>
        </div>

        <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
            <input name="name" value={profileForm.name} onChange={handleProfileChange} className="w-full px-4 py-3 border rounded-xl cursor-text" placeholder="Nama lengkap" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
            <input name="phone" value={profileForm.phone} onChange={handleProfileChange} className="w-full px-4 py-3 border rounded-xl cursor-text" placeholder="08xxxxxxxxxx" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Provinsi</label>
            <input name="provinsi" value={profileForm.provinsi} onChange={handleProfileChange} className="w-full px-4 py-3 border rounded-xl cursor-text" placeholder="Provinsi" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kota/Kabupaten</label>
            <input name="kota" value={profileForm.kota} onChange={handleProfileChange} className="w-full px-4 py-3 border rounded-xl cursor-text" placeholder="contoh: Kab. Bekasi" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kecamatan</label>
            <input name="kecamatan" value={profileForm.kecamatan} onChange={handleProfileChange} className="w-full px-4 py-3 border rounded-xl cursor-text" placeholder="contoh: Cibitung" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kelurahan</label>
            <input name="kelurahan" value={profileForm.kelurahan} onChange={handleProfileChange} className="w-full px-4 py-3 border rounded-xl cursor-text" placeholder="contoh: Wanasari" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Jalan</label>
            <input name="namaJalan" value={profileForm.namaJalan} onChange={handleProfileChange} className="w-full px-4 py-3 border rounded-xl cursor-text" placeholder="contoh: Jl. Bosih Raya" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gang</label>
            <input name="gang" value={profileForm.gang} onChange={handleProfileChange} className="w-full px-4 py-3 border rounded-xl cursor-text" placeholder="contoh: Gang Bunga" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">RT/RW</label>
            <input name="rtRw" value={profileForm.rtRw} onChange={handleProfileChange} className="w-full px-4 py-3 border rounded-xl cursor-text" placeholder="contoh: 001/015" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">No. Rumah</label>
            <input name="noRumah" value={profileForm.noRumah} onChange={handleProfileChange} className="w-full px-4 py-3 border rounded-xl cursor-text" placeholder="contoh: 5" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            {profileErr && <div className="px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">{profileErr}</div>}
            {profileMsg && <div className="px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm">{profileMsg}</div>}
            <button 
              type="submit"
              disabled={profileSaving} 
              className="bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition disabled:opacity-60 cursor-pointer"
            >
              {profileSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
        {profileLoading && <div className="text-sm text-gray-500 mt-3">Memuat profil...</div>}
        
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-700 mb-3">Contoh Format Alamat yang Benar:</h4>
          <div className="text-sm text-blue-600 space-y-1">
            <div>• Provinsi: Jawa Barat</div>
            <div>• Kota/Kabupaten: Kab. Bekasi</div>
            <div>• Kecamatan: Cibitung</div>
            <div>• Kelurahan: Wanasari</div>
            <div>• Nama Jalan: Jl. Bosih Raya</div>
            <div>• Gang: Bunga</div>
            <div>• RT/RW: 001/017</div>
            <div>• No. Rumah: 5</div>
            <div className="font-semibold mt-2">Hasil: Jawa Barat, Kab. Bekasi, Cibitung, Wanasari, Jl. Bosih Raya, Gang Bunga, RT/RW 001/017, No. 5</div>
          </div>
        </div>
      </div>
    </div>
  );
}
