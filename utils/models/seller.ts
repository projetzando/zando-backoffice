export interface Seller extends Timestamps {
    readonly id?: string
    user_id?: string
    company_name: string
    company_description?: string
    company_logo?: string
    phone?: string
    email?: string
    website?: string
    is_approved?: boolean
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