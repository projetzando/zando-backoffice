export interface CartReservation extends Timestamps {
  readonly id?: string
  user_id: string
  product_id: string
  variation_id?: string
  quantity: number
  reserved_at?: string
  expires_at?: string
  
  // Relations
  user?: Profile
  product?: Product
  variation?: ProductVariation
}