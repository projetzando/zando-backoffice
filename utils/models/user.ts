export interface User extends Timestamps {
  readonly id?: number
  name: string
  first_name?: string
  email?: string
  password?: string
  password_confirmation?: string
  // role?: Group
  // roles?: Group[]
  role_id?: number
}
