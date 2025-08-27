export interface ProductRow {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  is_active: boolean | null;
  image_url: string | null;
  product_categories: { name: string } | null;
  tags?: string[];
}

export interface CategoryRow {
  id: number;
  name: string;
}

export interface ProductFormData {
  name: string;
  category_id: string;
  price: string;
  description: string;
  tags?: string[];
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
}

export interface Transaction {
  id: number;
  order_date: string;
  project_status: string;
  estimated_price: number;
  payment_method: 'DP' | 'Cicil' | 'Full Payment';
  total_paid: number;
  description: string;
  estimated_completion: string | null;
  customers: Customer;
  product_categories: CategoryRow;
  products: ProductRow;
  payment_history: PaymentHistory[];
  project_updates: ProjectUpdate[];
  reviews: Review[];
}

export interface PaymentHistory {
  id: number;
  payment_amount: number;
  payment_date: string;
  payment_notes: string | null;
  payment_proof: string | null;
}

export interface ProjectUpdate {
  id: number;
  status: string;
  description: string;
  photo_url: string | null;
  created_at: string;
}

export interface Review {
    id: number;
    rating: number;
    comment: string | null;
    is_published: boolean;
    show_name: boolean;
}