"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Dialog } from "@headlessui/react";
import dynamic from 'next/dynamic';
import type { User } from '@supabase/supabase-js';

// Lazy load FaqSection
const FaqSection = dynamic(() => import("@/app/user-dashboard/components/FaqSection"), {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>,
	ssr: true,
});

const menuItems = [
	{ key: "profile", label: "Profil" },
	{ key: "orders", label: "Pesanan Saya" },
	{ key: "order-new", label: "Pesan Baru" },
	{ key: "review", label: "Review" },
	{ key: "faq", label: "FAQ & Bantuan" },
];

export default function UserDashboardPage() {
	const [activeMenu, setActiveMenu] = useState("profile");
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false); // State untuk mobile sidebar
	const router = useRouter();

	// Profil state
	const [customerId, setCustomerId] = useState<number | null>(null);
	const [profileLoading, setProfileLoading] = useState(false);
	const [profileSaving, setProfileSaving] = useState(false);
	const [profileMsg, setProfileMsg] = useState<string>("");
	const [profileErr, setProfileErr] = useState<string>("");
	const [profileForm, setProfileForm] = useState<{ 
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
		email: string 
	}>({
		name: "", 
		phone: "", 
		provinsi: "", 
		kota: "", 
		kecamatan: "", 
		kelurahan: "", 
		namaJalan: "", 
		gang: "", 
		rtRw: "", 
		noRumah: "", 
		email: ""
	});

	useEffect(() => {
		(async () => {
			const { data } = await supabase.auth.getUser();
			if (!data?.user) {
				router.replace("/customer-login");
				return;
			}
			setUser(data.user);
			setLoading(false);
		})();
	}, [router]);

	// Fetch profil customers berdasarkan auth_user_id
	useEffect(() => {
		(async () => {
			if (!user?.id) return;
			setProfileLoading(true);
			setProfileErr("");
			const { data, error } = await supabase
				.from("customers")
				.select("id,name,phone,address,email")
				.eq("auth_user_id", user.id)
				.maybeSingle();
			if (error) {
				setProfileErr("Gagal memuat profil");
			} else if (data) {
				setCustomerId(data.id);
				// Parse alamat dari string menjadi field terpisah
				const addressParts = (data.address || "").split(", ");
				
				// Parse RT/RW dan No. Rumah dari format yang ada
				let rtRw = "", noRumah = "";
				const rtRwPart = addressParts.find((part: string) => part.includes("RT/RW"));
				const noRumahPart = addressParts.find((part: string) => part.includes("No."));
				
				if (rtRwPart) {
					// Extract hanya angka dari RT/RW, hapus kata "RT/RW"
					const rtRwMatch = rtRwPart.match(/RT\/RW (.+)/);
					if (rtRwMatch) {
						rtRw = rtRwMatch[1]; // Ambil bagian setelah "RT/RW "
					}
				}
				
				if (noRumahPart) {
					const noMatch = noRumahPart.match(/No\. (\d+)/);
					if (noMatch) {
						noRumah = noMatch[1];
					}
				}
				
				// Filter out RT/RW dan No. dari addressParts untuk field lainnya
				const otherParts = addressParts.filter((part: string) => 
					!part.includes("RT/RW") && !part.includes("No.")
				);
				
				// Parse Gang field - hapus kata "Gang" di depan
				let gangField = otherParts[5] || "";
				if (gangField.startsWith("Gang ")) {
					gangField = gangField.replace("Gang ", "");
				}
				
				setProfileForm({
					name: data.name || "",
					phone: data.phone || "",
					provinsi: otherParts[0] || "",
					kota: otherParts[1] || "",
					kecamatan: otherParts[2] || "",
					kelurahan: otherParts[3] || "",
					namaJalan: otherParts[4] || "",
					gang: gangField,
					rtRw: rtRw,
					noRumah: noRumah,
					email: data.email || user.email || "",
				});
			} else {
				// Buat record customer baru jika tidak ada
				const { data: newCustomer, error: createError } = await supabase
					.from("customers")
					.insert({
						auth_user_id: user.id,
						name: user.user_metadata?.name || user.email || "",
						email: user.email,
						phone: user.user_metadata?.phone || null,
						address: user.user_metadata?.address || null
					})
					.select("id,name,phone,address,email")
					.single();
				
				if (createError) {
					setProfileErr("Gagal membuat profil baru");
				} else {
					setCustomerId(newCustomer.id);
					setProfileForm({
						name: newCustomer.name || "",
						phone: newCustomer.phone || "",
						provinsi: "",
						kota: "",
						kecamatan: "",
						kelurahan: "",
						namaJalan: "",
						gang: "", // Add gang field
						rtRw: "", // Combine RT and RW
						noRumah: "",
						email: newCustomer.email || user.email || "",
					});
				}
			}
			setProfileLoading(false);
		})();
	}, [user]);

	const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const target = e.target as HTMLInputElement | HTMLTextAreaElement;
		const { name, value } = target;
		setProfileForm(prev => ({ ...prev, [name]: value }));
	};

	const handleProfileSave = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Jika customerId masih null, coba fetch ulang
		if (!customerId) {
			const { data: retryData } = await supabase
				.from("customers")
				.select("id")
				.eq("auth_user_id", user?.id)
				.maybeSingle();
			
			if (retryData?.id) {
				setCustomerId(retryData.id);
			} else {
				setProfileErr("Profil belum siap, silakan refresh halaman");
				return;
			}
		}
		
		setProfileSaving(true);
		setProfileMsg("");
		setProfileErr("");
		
		// Format RT/RW dan No. Rumah
		const rtRw = profileForm.rtRw ? `RT/RW ${profileForm.rtRw}` : "";
		const noRumah = profileForm.noRumah ? `No. ${profileForm.noRumah}` : "";
		
		// Gabungkan semua field alamat menjadi satu string dengan format yang diinginkan
		const fullAddress = [
			profileForm.provinsi,
			profileForm.kota,
			profileForm.kecamatan,
			profileForm.kelurahan,
			profileForm.namaJalan,
			profileForm.gang,
			rtRw,
			noRumah
		].filter(Boolean).join(", ");

		try {
			const { error } = await supabase
				.from("customers")
				.update({ 
					name: profileForm.name, 
					phone: profileForm.phone || null, 
					address: fullAddress || null 
				})
				.eq("id", customerId);
			
			if (error) {
				setProfileErr(error.message || "Gagal menyimpan profil");
			} else {
				setProfileMsg("Profil berhasil diperbarui");
			}
		        } catch {
            setProfileErr("Terjadi kesalahan sistem");
        }
		setProfileSaving(false);
	};

	const handleLogout = async () => {
		setShowLogoutModal(false);
		await supabase.auth.signOut();
		router.replace("/customer-login");
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center text-gray-600">Memuat...</div>
		);
	}

	const isEmailVerified = Boolean(user?.email_confirmed_at);

	return (
		<div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-orange-50 to-white">
			{/* Mobile Toggle Button */}
			<button
				onClick={() => setSidebarOpen(!sidebarOpen)}
				className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
			>
				{sidebarOpen ? (
					<svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				) : (
					<svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				)}
			</button>

			{/* Sidebar */}
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
								// Auto-hide sidebar on mobile after menu selection
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
				{/* Modal Konfirmasi Logout */}
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

			{/* Overlay untuk mobile */}
			{sidebarOpen && (
				<div 
					className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Main Content */}
			<main className="flex-1 p-4 lg:p-8 pt-24 lg:pt-8">
				{activeMenu === "profile" && (
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
							
							{/* Contoh Format Alamat */}
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
				)}
				{activeMenu === "orders" && (
					<div className="text-xl font-semibold text-gray-700">[Daftar Pesanan Anda akan tampil di sini]</div>
				)}
				{activeMenu === "order-new" && (
					<div className="text-xl font-semibold text-gray-700">[Form Pesan Baru akan tampil di sini]</div>
				)}
				{activeMenu === "review" && (
					<div className="text-xl font-semibold text-gray-700">[Review & Rating akan tampil di sini]</div>
				)}
				{activeMenu === "faq" && (
					<div className="text-xl font-semibold text-gray-700"><FaqSection /></div>
				)}
			</main>
		</div>
	);
}
