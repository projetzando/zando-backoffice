export interface Brand extends Timestamps {
    readonly id?: string
    name: string
    image?: string
    is_featured?: boolean
    products_count?: number
}