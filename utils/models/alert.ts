export interface Alert extends Timestamps {
  readonly id?: string
  conversation_id: string
  message_id?: string
  sender_id: string
  alert_type: string
  detected_content?: string
  message_content: string
  status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
  reviewed_at?: string
  reviewed_by?: string
  metadata?: Record<string, any>
  conversation?: {
    id: string
  }
  message?: {
    id: string
    content: string
  }
  sender?: {
    id: string
    first_name: string
    last_name: string
  }
}
