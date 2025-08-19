export interface ProductRow {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  is_active: boolean | null;
  image_url: string | null;
  product_categories: { name: string } | null;
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
}
