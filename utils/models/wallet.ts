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

export interface Transaction extends Timestamps {
  readonly id?: string
  wallet_id: string
  transaction_type: 'credit' | 'debit'
  amount: number
  balance_before?: number
  balance_after?: number
  reason?: string
  reference?: string
  metadata?: Record<string, any>
}
