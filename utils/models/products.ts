export interface Product extends Timestamps {
  readonly id?: string
  seller_id: string
  category_id?: string
  title: string
  description: string
  price?: number
  sale_price?: number
  stock: number
  images?: string[]
  is_active?: boolean
  is_featured?: boolean
  cover_image?: string
  product_type?: 'simple' | 'variable'
  // Relations
  seller?: Seller
  category?: Category
  product_variations?: ProductVariation[]
  product_attributes?: ProductAttribute[]
}

export interface ProductVariation extends Timestamps {
  readonly id?: string
  product_id: string
  variation_name: string
  attributes: Record<string, any>
  price?: number
  sale_price?: number
  stock?: number
  cover_image?: string
  is_active?: boolean
}

export interface ProductAttribute extends Timestamps {
  readonly id?: string
  product_id: string
  name: string
  values: string
}

// Interface pour la vue products_with_price (correspond exactement à la vue SQL)
export interface ProductWithPrice {
  // Champs de base de products
  id: string
  seller_id: string
  category_id?: string
  title: string
  description: string
  price?: number
  sale_price?: number
  stock: number
  images?: string[]
  is_active: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  cover_image?: string
  product_type: 'simple' | 'variable'

  // Champs calculés par la vue
  display_price: number
  available_stock: number
  review_count: number
  avg_rating?: number
  variations?: any[] // JSON des variations actives
}
