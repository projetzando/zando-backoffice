export interface Order extends Timestamps {
  readonly id?: string;
  buyer_id?: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  total_amount: number;
  shipping_address_id?: string;
  billing_address_id?: string;
  shipping_method: string;
  shipping_cost: number;

  // Relations
  buyer?: Profile;
  shipping_address?: Address;
  billing_address?: Address;
  order_items?: OrderItem[];
  payments?: Payment[];
}

export interface OrderItem extends Timestamps {
  readonly id?: string;
  order_id?: string;
  product_id?: string;
  seller_id?: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

  // Relations
  product?: Product;
  seller?: Seller;
  variant?: ProductVariant;
}

export interface Address extends Timestamps {
  readonly id?: string;
  user_id?: string;
  type: "billing" | "shipping";
  name?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone?: string;
  is_default?: boolean;
}

export interface Payment extends Timestamps {
  readonly id?: string;
  order_id?: string;
  amount: number;
  payment_method: string;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "cancelled"
    | "refunded";
  transaction_id?: string;
  metadata?: object;
}

export interface Profile extends Timestamps {
  readonly id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role: "buyer" | "seller" | "admin";
  status: "active" | "inactive" | "suspended";
  avatar_url?: string;
  bio?: string;
  preferences?: object;
  language: string;
}

// Types pour les filtres et recherches
export interface OrderFilters {
  status?: string;
  buyer_id?: string;
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

// Types pour le panier (avant transformation en commande)
export interface CartItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface Cart extends Timestamps {
  readonly id?: string;
  user_id?: string;
  cart_items?: CartItem[];
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
