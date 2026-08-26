export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  position: number;
};

export type Product = {
  id: string;
  name: string;
  reference: string;
  description: string | null;
  composition: string | null;
  price: number;
  old_price: number | null;
  category_id: string | null;
  gender: string;
  type: string;
  sizes: string[];
  colors: string[];
  stock: number;
  is_featured: boolean;
  is_promotion: boolean;
  is_new: boolean;
  is_active: boolean;
  sold_count: number;
  created_at: string;
  product_images?: ProductImage[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  gender: string | null;
  type: string | null;
  is_gender_category: boolean;
};

export type StoreSettings = {
  shipping_fee: number;
};

export type PromoCode = {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  is_active: boolean;
  expires_at: string | null;
};

export type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  governorate: string;
  city: string;
  address: string;
  postal_code: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_reference: string;
  product_image: string | null;
  size: string | null;
  color: string | null;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  order_number: string;
  customer_id: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  governorate: string;
  city: string;
  address: string;
  postal_code: string | null;
  note: string | null;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  promo_code: string | null;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
};

export type CartItem = {
  product_id: string;
  name: string;
  reference: string;
  image: string | null;
  price: number;
  size: string;
  color: string;
  quantity: number;
  stock: number;
};
