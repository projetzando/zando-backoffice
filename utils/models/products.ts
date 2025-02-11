export interface Product extends Timestamps {
    readonly id?: string
    seller_id?: string
    category_id?: string
    title: string
    description: string
    price: number
    sale_price: number
    stock: number
    status: string
    sku?: string
    weight?: number
    dimensions?: object
    thumbnail?: string
    brand_id?: string
}

export interface ProductImage extends Timestamps {
    readonly id?: string
    product_id?: string
    url?: string
    position?: number
    is_main?: boolean
}

export interface ProductVariant extends Timestamps {
    readonly id?: string
    product_id?: string
    price?: number
    stock?: number
    sku?: string
    attributes?: object
}

export interface ProductView extends Timestamps {
    readonly id?: string
    product_id?: string
    user_id?: string
    ip_address?: string
    device_info?: object
    viewed_at?: string
}