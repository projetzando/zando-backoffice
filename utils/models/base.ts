export interface Timestamps {
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date
}

export interface Option {
  value: number | boolean
  label?: string
}
