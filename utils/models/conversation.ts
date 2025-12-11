export interface Conversation extends Timestamps {
  readonly id?: string
  seller_id: string
  buyer_id: string
  last_message?: string
  last_message_at?: string

  // Relations
  seller?: Seller
  buyer?: Profile
  messages?: Message[]
}

export interface Message extends Timestamps {
  readonly id?: string
  conversation_id: string
  sender_id: string
  content: string
  is_read?: boolean
  product_id?: string

  // Relations
  conversation?: Conversation
  sender?: Profile
  product?: Product
}
