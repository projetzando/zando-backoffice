export interface Fee extends Timestamps {
  readonly id?: string
  name: string
  label?: string
  description?: string
  is_percentage?: boolean
  base_amount?: number
  is_active?: boolean
}

export interface FeeRule extends Timestamps {
  readonly id?: string
  fee_id: string
  applies_to_type: string // 'order', 'product', 'seller', etc.
  applies_to_id?: string
  min_value?: number
  max_value?: number
  amount?: number
  percentage?: number
  priority?: number
  is_active?: boolean
  metadata?: Record<string, any>
  fee?: {
    id: string
    name: string
    label?: string
  }
}

export interface SellerDomain extends Timestamps {
  readonly id?: string
  domain: string
  description?: string
  update_at?: string
}
