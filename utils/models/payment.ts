export interface Payment extends Timestamps {
    readonly id?: string
    order_id: string
    amount: number
    method: string
    status?: 'pending' | 'completed' | 'failed' | 'cancelled'
    transaction_ref?: string
    safe_reference?: string
    order?: {
        id: string
        reference: string
        total_price: number
        buyer?: {
            id: string
            first_name: string
            last_name: string
        }
    }
}
