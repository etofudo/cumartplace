import type { Request } from 'express';

// ── Database row shapes ────────────────────────────────────────────────────

export interface UserRow {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone: string | null;
  role: 'buyer' | 'vendor' | 'admin';
  created_at: Date;
}

export interface StoreRow {
  store_id: number;
  vendor_id: number;
  store_name: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  registered_at: Date;
  // joined from queries
  vendor_name?: string;
  avg_rating?: string; // DECIMAL comes as string from pg
  rating_count?: string;
}

export interface ProductRow {
  product_id: number;
  store_id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: string; // DECIMAL comes as string from pg
  stock_quantity: number;
  image_url: string | null;
  is_available: boolean;
  created_at: Date;
  // joined from queries
  category_name?: string;
  store_name?: string;
  avg_rating?: string;
  review_count?: string;
}

export interface CategoryRow {
  category_id: number;
  name: string;
  description: string | null;
}

export interface CartRow {
  cart_id: number;
  buyer_id: number;
  updated_at: Date;
}

export interface CartItemRow {
  cart_item_id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  // joined fields
  name?: string;
  price?: string;
  image_url?: string | null;
  store_name?: string;
}

export interface OrderRow {
  order_id: number;
  buyer_id: number;
  total_amount: string;
  order_status: 'pending' | 'completed' | 'cancelled';
  created_at: Date;
  items?: OrderItemRow[];
}

export interface OrderItemRow {
  order_item_id: number;
  order_id: number;
  product_id: number;
  store_id: number;
  quantity: number;
  unit_price: string;
  // joined
  name?: string;
}

export interface ProductReviewRow {
  review_id: number;
  product_id: number;
  buyer_id: number;
  rating: number;
  comment: string | null;
  created_at: Date;
  first_name?: string;
  last_name?: string;
}

export interface StoreRatingRow {
  store_rating_id: number;
  store_id: number;
  buyer_id: number;
  rating: number;
  created_at: Date;
  first_name?: string;
  last_name?: string;
}

// ── JWT payload ────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

// ── Express request augmented with authenticated user ──────────────────────

export interface AuthRequest extends Request {
  user: JwtPayload;
}
