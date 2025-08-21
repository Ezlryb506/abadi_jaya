"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import dynamic from 'next/dynamic';

// Import new components
import Sidebar from "@/app/user-dashboard/components/Sidebar";
import ProfileSection from "@/app/user-dashboard/components/ProfileSection";
import OrdersSection from "@/app/user-dashboard/components/OrdersSection";

// Lazy load FaqSection
const FaqSection = dynamic(() => import("@/app/user-dashboard/components/FaqSection"), {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>,
	ssr: true,
});

export default function UserDashboardPage() {
	const [activeMenu, setActiveMenu] = useState("profile");
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const router = useRouter();

	// Profil state
	const [customerId, setCustomerId] = useState<number | null>(null);
	const [profileLoading, setProfileLoading] = useState(false);
	const [profileSaving, setProfileSaving] = useState(false);
	const [profileMsg, setProfileMsg] = useState<string>("");
	const [profileErr, setProfileErr] = useState<string>("");
	    // Orders state
	const [orders, setOrders] = useState<any[]>([]);
	const [ordersLoading, setOrdersLoading] = useState(false);
	const [ordersErr, setOrdersErr] = useState<string>("");

	const [profileForm, setProfileForm] = useState({ 
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
				const addressParts = (data.address || "").split(", ");
				
				let rtRw = "", noRumah = "";
				const rtRwPart = addressParts.find((part: string) => part.includes("RT/RW"));
				const noRumahPart = addressParts.find((part: string) => part.includes("No."));
				
				if (rtRwPart) {
					const rtRwMatch = rtRwPart.match(/RT\/RW (.+)/);
					if (rtRwMatch) rtRw = rtRwMatch[1];
				}
				
				if (noRumahPart) {
					const noMatch = noRumahPart.match(/No\. (\d+)/);
					if (noMatch) noRumah = noMatch[1];
				}
				
				const otherParts = addressParts.filter((part: string) => 
					!part.includes("RT/RW") && !part.includes("No.")
				);
				
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
				const { data: newCustomer, error: createError } = await supabase
					.from("customers")
					.insert({ auth_user_id: user.id, name: user.user_metadata?.name || user.email || "", email: user.email, phone: user.user_metadata?.phone || null, address: user.user_metadata?.address || null })
					.select("id,name,phone,address,email")
					.single();
				
				if (createError) {
					setProfileErr("Gagal membuat profil baru");
				} else {
					setCustomerId(newCustomer.id);
					setProfileForm({ name: newCustomer.name || "", phone: newCustomer.phone || "", provinsi: "", kota: "", kecamatan: "", kelurahan: "", namaJalan: "", gang: "", rtRw: "", noRumah: "", email: newCustomer.email || user.email || "" });
				}
			}
			setProfileLoading(false);
		})();
	    }, [user]);

    	// Fetch orders berdasarkan customer_id
	const fetchOrders = useCallback(async () => {
		if (!customerId) return;
		setOrdersLoading(true);
		setOrdersErr("");
		const { data, error } = await supabase
			.from("transactions")
			.select(`
				id,
				created_at,
				estimated_completion,
				estimated_price,
				project_status,
				products:products(name, product_categories(name)),
				customers:customers(name),
				payment_history (*),
				project_updates (*),
				reviews (*)
			`)
			.eq("customer_id", customerId)
			.order("created_at", { ascending: false });

		if (error) {
			setOrdersErr("Gagal memuat data pesanan");
		} else {
			setOrders(data || []);
		}
		setOrdersLoading(false);
	}, [customerId]);

	useEffect(() => {
		if (!customerId) return;
		fetchOrders();
	}, [customerId, fetchOrders]);

	// Realtime subscription
	useEffect(() => {
		if (!customerId) return;
		// Buat channel khusus per customer agar mudah dibersihkan
		const channel = supabase
			.channel(`user-dashboard:${customerId}`)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `customer_id=eq.${customerId}` }, () => {
				fetchOrders();
			})
			.on('postgres_changes', { event: '*', schema: 'public', table: 'project_updates' }, (payload) => {
				// Jika menyangkut transaksi milik customer ini, refetch
				const txId = (payload.new as any)?.transaction_id ?? (payload.old as any)?.transaction_id;
				if (!txId) return;
				const involve = orders.some(o => o.id === txId);
				if (involve) fetchOrders();
			})
			.on('postgres_changes', { event: '*', schema: 'public', table: 'payment_history' }, (payload) => {
				const txId = (payload.new as any)?.transaction_id ?? (payload.old as any)?.transaction_id;
				if (!txId) return;
				const involve = orders.some(o => o.id === txId);
				if (involve) fetchOrders();
			})
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	// sengaja depend di customerId & orders agar filter berjalan, dan channel terganti bila customer berubah
	}, [customerId, orders, fetchOrders]);

	const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target as any;
		setProfileForm(prev => ({ ...prev, [name]: value }));
	};

	const handleProfileSave = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!customerId) {
			const { data: retryData } = await supabase.from("customers").select("id").eq("auth_user_id", user?.id).maybeSingle();
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
		
		const rtRw = profileForm.rtRw ? `RT/RW ${profileForm.rtRw}` : "";
		const noRumah = profileForm.noRumah ? `No. ${profileForm.noRumah}` : "";
		
		const fullAddress = [profileForm.provinsi, profileForm.kota, profileForm.kecamatan, profileForm.kelurahan, profileForm.namaJalan, profileForm.gang, rtRw, noRumah].filter(Boolean).join(", ");

		try {
			const { error } = await supabase
				.from("customers")
				.update({ name: profileForm.name, phone: profileForm.phone || null, address: fullAddress || null })
				.eq("id", customerId);
			
			if (error) {
				setProfileErr(error.message || "Gagal menyimpan profil");
			} else {
				setProfileMsg("Profil berhasil diperbarui");
			}
		} catch (err) {
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

	const renderContent = () => {
		switch (activeMenu) {
			case 'profile':
				return <ProfileSection 
					user={user} 
					profileForm={profileForm} 
					handleProfileChange={handleProfileChange} 
					handleProfileSave={handleProfileSave} 
					profileSaving={profileSaving} 
					profileLoading={profileLoading} 
					profileMsg={profileMsg} 
					profileErr={profileErr} 
				/>;
			case 'orders':
				return <OrdersSection orders={orders} loading={ordersLoading} error={ordersErr} customerId={customerId} />;
case 'faq':
				return <FaqSection />;
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-orange-50 to-white">
			<button
				onClick={() => setSidebarOpen(!sidebarOpen)}
				className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
			>
				{sidebarOpen ? (
					<svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
				) : (
					<svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
				)}
			</button>

			<Sidebar 
				user={user}
				profileForm={profileForm}
				activeMenu={activeMenu}
				setActiveMenu={setActiveMenu}
				handleLogout={handleLogout}
				showLogoutModal={showLogoutModal}
				setShowLogoutModal={setShowLogoutModal}
				sidebarOpen={sidebarOpen}
				setSidebarOpen={setSidebarOpen}
			/>

			<main className="flex-1 p-4 lg:p-8 pt-24 lg:pt-8">
				{renderContent()}
			</main>
		</div>
	);
}
