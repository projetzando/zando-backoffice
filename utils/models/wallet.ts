import type { Timestamps } from './base'

export interface Wallet extends Timestamps {
  readonly id?: string
  owner_type: string // 'seller' | 'system'
  owner_id?: string
  is_system?: boolean
  currency?: string
  balance?: number
  locked_balance?: number
}

export interface WalletTransaction extends Timestamps {
  readonly id?: string
  wallet_id: string
  type: 'credit' | 'debit'
  amount: number
  description?: string
  reference?: string
  status?: 'pending' | 'completed' | 'failed'
  metadata?: Record<string, any>
}
