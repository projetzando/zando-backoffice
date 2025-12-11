export interface BannedTerm extends Timestamps {
  readonly id?: string
  category: 'phone_number' | 'email' | 'external_contact' | 'custom'
  term: string
  is_regex?: boolean
  custom_alert_message?: string
  is_active?: boolean
  description?: string
  severity?: 'low' | 'medium' | 'high'
  created_by?: string
  updated_by?: string
}
