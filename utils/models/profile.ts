import type { Timestamps } from './base'

export interface Profile extends Timestamps {
  readonly id?: string
  first_name?: string
  last_name?: string
  phone?: string
  role?: 'buyer' | 'seller' | 'admin' | 'superadmin'
  avatar_url?: string
}
