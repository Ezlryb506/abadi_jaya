"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import dynamic from 'next/dynamic';
import type { User } from '@supabase/supabase-js';

// Import new components
import Sidebar from "@/app/user-dashboard/components/Sidebar";
import ProfileSection from "@/app/user-dashboard/components/ProfileSection";
import OrdersSection from "@/app/user-dashboard/components/OrdersSection";

// Lazy load FaqSection
const FaqSection = dynamic(() => import("@/app/user-dashboard/components/FaqSection"), {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>,
	ssr: true,
});

type TransactionRow = {
    id: number;
    created_at: string;
    estimated_completion: string | null;
    estimated_price: number | null;
    project_status: string | null;
    products: { name: string; product_categories: { name: string } | null } | null;
    customers: { name: string } | null;
    payment_history: Array<{
        id: number;
        payment_amount: number;
        payment_date: string;
        payment_notes: string | null;
        payment_proof: string | null;
    }>;
    project_updates: Array<{
        id: number;
        status: string;
        description: string | null;
        created_at: string;
        photo_url: string | null;
    }>;
    reviews: Array<{
        id: number;
        rating: number;
        comment: string | null;
        show_name: boolean;
        display_name: string | null;
    }>;
};

export default function UserDashboardPage() {
	const [activeMenu, setActiveMenu] = useState("profile");
	const [user, setUser] = useState<User | null>(null);
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
	const [orders, setOrders] = useState<TransactionRow[]>([]);
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
			const takeFirstObject = (v: unknown): Record<string, unknown> | null => {
				if (Array.isArray(v)) {
					const first = v[0];
					return first && typeof first === 'object' ? (first as Record<string, unknown>) : null;
				}
				return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
			};

			const normalized: TransactionRow[] = (Array.isArray(data) ? data : []).map((row: unknown) => {
				const r = row as Record<string, unknown>;
				const prodObj = takeFirstObject(r.products);
				const catObj = prodObj ? takeFirstObject((prodObj as Record<string, unknown>)["product_categories"]) : null;
				const custObj = takeFirstObject(r.customers);

				return {
					id: Number(r.id),
					created_at: String(r.created_at ?? ''),
					estimated_completion: r.estimated_completion ? String(r.estimated_completion) : null,
					estimated_price: typeof r.estimated_price === 'number' ? (r.estimated_price as number) : (r.estimated_price ? Number(r.estimated_price) : null),
					project_status: r.project_status ? String(r.project_status) : null,
					products: prodObj ? {
						name: typeof prodObj["name"] === 'string' ? (prodObj["name"] as string) : String(prodObj["name"] ?? ''),
						product_categories: catObj ? { name: typeof catObj["name"] === 'string' ? (catObj["name"] as string) : String(catObj["name"] ?? '') } : null,
					} : null,
					customers: custObj ? { name: typeof custObj["name"] === 'string' ? (custObj["name"] as string) : String(custObj["name"] ?? '') } : null,
					payment_history: Array.isArray(r.payment_history) ? (r.payment_history as Array<unknown>).map((pv) => {
						const p = pv as Record<string, unknown>;
						return {
							id: Number(p.id),
							payment_amount: Number(p.payment_amount ?? 0),
							payment_date: String(p.payment_date ?? ''),
							payment_notes: p.payment_notes ? String(p.payment_notes) : null,
							payment_proof: p.payment_proof ? String(p.payment_proof) : null,
						};
					}) : [],
					project_updates: Array.isArray(r.project_updates) ? (r.project_updates as Array<unknown>).map((uv) => {
						const u = uv as Record<string, unknown>;
						return {
							id: Number(u.id),
							status: String(u.status ?? ''),
							description: u.description ? String(u.description) : null,
							created_at: String(u.created_at ?? ''),
							photo_url: u.photo_url ? String(u.photo_url) : null,
						};
					}) : [],
					reviews: Array.isArray(r.reviews) ? (r.reviews as Array<unknown>).map((rvv) => {
						const rv = rvv as Record<string, unknown>;
						return {
							id: Number(rv.id),
							rating: Number(rv.rating ?? 0),
							comment: rv.comment ? String(rv.comment) : null,
							show_name: Boolean(rv.show_name),
							display_name: rv.display_name ? String(rv.display_name) : null,
						};
					}) : [],
				};
			});
			setOrders(normalized);
		}
		setOrdersLoading(false);
	}, [customerId]);

	useEffect(() => {
		if (!customerId) return;
		fetchOrders();
	}, [customerId, fetchOrders]);

	const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const target = e.target as HTMLInputElement | HTMLTextAreaElement;
		const { name, value } = target;
		setProfileForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleProfileSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!customerId) return;
		setProfileSaving(true);
		setProfileMsg("");
		setProfileErr("");

		const rtRw = profileForm.rtRw ? `RT/RW ${profileForm.rtRw}` : "";
		const noRumah = profileForm.noRumah ? `No. ${profileForm.noRumah}` : "";
		const fullAddress = [
			profileForm.provinsi,
			profileForm.kota,
			profileForm.kecamatan,
			profileForm.kelurahan,
			profileForm.namaJalan,
			profileForm.gang,
			rtRw,
			noRumah,
		]
			.filter(Boolean)
			.join(", ");

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

	const renderContent = () => {
		switch (activeMenu) {
			case 'profile':
				return (
					<ProfileSection
						user={user}
						profileForm={profileForm}
						handleProfileChange={handleProfileChange}
						handleProfileSave={handleProfileSave}
						profileSaving={profileSaving}
						profileLoading={profileLoading}
						profileMsg={profileMsg}
						profileErr={profileErr}
					/>
				);
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
				profileForm={{ name: profileForm.name }}
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
