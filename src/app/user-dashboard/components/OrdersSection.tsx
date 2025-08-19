import LocalTime from './LocalTime';

interface OrdersSectionProps {
	orders: any[];
	loading: boolean;
	error: string;
}

export default function OrdersSection({ orders, loading, error }: OrdersSectionProps) {
	if (loading) {
		return (
			<div className="space-y-4">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="bg-white p-4 rounded-lg shadow-md animate-pulse">
						<div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
						<div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
						<div className="h-8 bg-gray-200 rounded w-full"></div>
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return <div className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>;
	}

	if (orders.length === 0) {
		return <div className="text-gray-500 bg-gray-100 p-4 rounded-lg">Anda belum memiliki pesanan.</div>;
	}

	return (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-gray-800">Pesanan Saya</h2>
			{orders.map(order => (
				<div key={order.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transition-shadow hover:shadow-xl">
					<div className="flex justify-between items-start mb-4">
						<div>
							<p className="font-semibold text-gray-500 text-sm">Order ID: #{order.id}</p>
							<p className="text-gray-400 text-xs mt-1"><LocalTime utcTime={order.created_at} /></p>
						</div>
						<span className={`px-3 py-1 text-xs font-semibold rounded-full ${order.project_status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
							{order.project_status}
						</span>
					</div>
					
					<div className="border-t border-gray-100 pt-4">
						{order.products && (
							<div className="flex items-center justify-between py-2 text-sm">
								<div className="flex items-center">
									<span className="font-semibold text-gray-800">{order.products.name}</span>
								</div>
							</div>
						)}
					</div>

					<div className="border-t-2 border-dashed border-gray-200 mt-4 pt-4 flex justify-between items-center">
						<span className="text-lg font-bold text-gray-800">Total</span>
						<span className="text-lg font-bold text-orange-500">Rp{order.estimated_price.toLocaleString('id-ID')}</span>
					</div>
				</div>
			))}
		</div>
	);
}
