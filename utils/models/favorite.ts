export interface Favorite extends Timestamps {
  readonly id?: string
  user_id: string
  product_id: string

  // Relations
  user?: Profile
  product?: Product
}
