export interface Payment extends Timestamps {
  readonly id?: string
  order_id: string
  amount: number
  method: string
  status?: 'unpaid' | 'pending' | 'completed' | 'failed'
  transaction_ref?: string
  safe_reference?: string
  order?: {
    id: string
    user_id: string
  }
}
