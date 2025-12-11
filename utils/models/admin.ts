export interface Admin extends Timestamps {
  readonly id?: string
  first_name?: string
  last_name?: string
  phone?: string
  role?: 'admin' | 'superadmin'
  avatar_url?: string | null
  email?: string
  is_active?: boolean
  last_login?: string
  permissions?: string[]
}

export interface AdminActivity extends Timestamps {
  readonly id?: string
  admin_id: string
  action: string
  entity_type?: string
  entity_id?: string
  details?: object
  ip_address?: string
}
