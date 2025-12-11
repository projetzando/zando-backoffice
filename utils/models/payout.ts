export interface Payout extends Timestamps {
  readonly id?: string
  wallet_id: string
  amount: number
  fee?: number
  payout_method?: string
  account_details?: Record<string, any>
  status?: 'pending' | 'approved' | 'rejected' | 'done' | 'failed'
  reference?: string
  requested_at?: string
  processed_at?: string
  wallet?: {
    id: string
    owner_id: string
    owner_type: string
    balance: number
  }
}
