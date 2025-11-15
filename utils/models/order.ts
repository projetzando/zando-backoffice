export interface Order extends Timestamps {
  readonly id?: string;
  user_id: string;
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_cost?: number;
  delivery_name: string;
  delivery_phone?: string;
  delivery_address: string;
  delivery_city: string;
  payment_method: string;
  notes?: string;

  // Relations
  buyer?: Profile;
  order_items?: OrderItem[];
  payments?: Payment[];
}

export interface OrderItem extends Timestamps {
  readonly id?: string;
  order_id: string;
  product_id: string;
  variation_id?: string;
  seller_id: string;
  product_title: string;
  variation_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;

  // Relations
  product?: Product;
  seller?: Seller;
  variation?: ProductVariation;
}

export interface Address extends Timestamps {
  readonly id?: string;
  user_id: string;
  name: string;
  phone?: string;
  address_line: string;
  city: string;
  is_default?: boolean;
}

export interface Payment extends Timestamps {
  readonly id?: string;
  order_id: string;
  amount: number;
  method: string;
  status?: 'pending' | 'completed' | 'failed';
  transaction_ref?: string;
}

export interface Profile extends Timestamps {
  readonly id?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: 'buyer' | 'seller' | 'admin' | 'superadmin';
  avatar_url?: string;
}

// Types pour les filtres et recherches
export interface OrderFilters {
  status?: string;
  // buyer_id supprimé - utiliser user_id à la place
  seller_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface OrderStats {
  total_orders: number;
  total_revenue: number;
  by_status: Record<string, number>;
  average_order_value: number;
}

// Types pour les actions sur les commandes
export interface OrderAction {
  type: "update_status" | "add_note" | "send_email" | "refund" | "ship";
  data: any;
  performed_by?: string;
  performed_at?: string;
}

// Types pour le panier
export interface CartItem extends Timestamps {
  readonly id?: string;
  user_id: string;
  product_id: string;
  // variant_id obsolète - utiliser variation_id
  variation_id?: string;
  quantity: number;
  
  // Relations
  product?: Product;
  variation?: ProductVariation;
}

// Interface pour la vue cart_with_details (correspond exactement à la vue SQL)
export interface CartWithDetails {
  // Champs de base de cart_items
  id: string;
  user_id: string;
  product_id: string;
  // variant_id obsolète - utiliser variation_id
  quantity: number;
  created_at: string;
  variation_id?: string;
  
  // Champs calculés par la vue
  product_title: string;
  product_image?: string;
  variation_name: string;
  variant_name: string;
  unit_price: number;
  total_price: number;
}

// Types pour les méthodes de livraison
export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  cost: number;
  estimated_days: number;
  is_active: boolean;
}

// Types pour les méthodes de paiement
export interface PaymentMethod {
  readonly id?: string;
  user_id?: string;
  type: "card" | "bank_transfer" | "mobile_money" | "cash";
  provider: string;
  token: string;
  is_default?: boolean;
  last_digits?: string;
  expiry_month?: number;
  expiry_year?: number;
  card_holder?: string;
  metadata?: object;
  expires_at?: string;
}
