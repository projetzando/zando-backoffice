export interface Review extends Timestamps {
  readonly id?: string
  product_id: string
  user_id: string
  order_id?: string
  rating: number // 1-5
  comment?: string
  images?: string[]
  
  // Relations
  product?: Product
  user?: Profile
  order?: Order
}