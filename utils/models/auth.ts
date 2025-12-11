export interface Auth {
  readonly id?: string
  name: string
  email?: string
  role?: 'buyer' | 'seller' | 'admin' | 'superadmin'
  // roles?: Group[]
  password?: string
  telephone?: string
}

export interface NewPassword {
  old_password: string
  password?: string
  password_confirmation?: string
}
