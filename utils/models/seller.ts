export interface Seller extends Timestamps {
    readonly id?: string
    user_id?: string | null
    company_name?: string
    legal_status?: string
    siret?: string | null
    vat_number?: string | null
    commission_rate?: number
}

export interface SellerSetting extends Timestamps {
    readonly id?: string
    seller_id: string
    auto_accept_orders?: boolean
    minimum_order_amount?: number
    shipping_methods?: object
    return_policy?: string
}

export interface SellerDocument extends Timestamps {
    readonly id?: string
    seller_id: string
    type: string
    file_url?: string | null
    status?: string
    validated_at?: string | null   
}

export interface SellerPayout extends Timestamps {
    readonly id?: string
    seller_id: string
    amount: number
    status?: string
    payout_method?: string
}